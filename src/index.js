import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";
import * as cheerio from "cheerio";
const PostalMime = require("postal-mime");

async function streamToArrayBuffer(stream, streamSize) {
  let result = new Uint8Array(streamSize);
  let bytesRead = 0;
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result.set(value, bytesRead);
    bytesRead += value.length;
  }
  return result;
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(await generateResearchEmail(env));
  },
  async email(message, env, ctx) {
    const allowList = [env.userEmail];
    if (allowList.indexOf(message.from) == -1) {
      message.setReject("Address not allowed");
    } else {
      const rawEmail = await streamToArrayBuffer(message.raw, message.rawSize);
      const parser = new PostalMime.default();
      const parsedEmail = await parser.parse(rawEmail);
      const topics = parsedEmail.text;
      const storageAgent = new StorageAgent(env);
      const response = await storageAgent.store(topics);

      return await sendConfirmation(response, env);
    }
  },
};

async function generateResearchEmail(env) {
  const topic = await getRandomTopicFromDB(env.DB);

  if (!topic) {
    console.error("No topic found");
    return;
  }

  const agent = new ResearchAgent(env);
  const content = await agent.respond(topic);

  await sendEmail(topic, content, env);
}

async function getRandomTopicFromDB(db) {
  const query = "SELECT topic FROM topics ORDER BY RANDOM() LIMIT 1";

  const { results } = await db.prepare(query).run();

  if (results && results.length) {
    return results[0].topic;
  }

  return null;
}

async function sendConfirmation(response, env) {
  const msg = createMimeMessage();
  msg.setSender({ name: "Research Agent", addr: env.researcherEmail });
  msg.setRecipient(env.userEmail);
  msg.setSubject("New Research Topics");

  msg.addMessage({
    contentType: "text/html",
    data: response,
  });

  const message = new EmailMessage(
    env.researcherEmail,
    env.userEmail,
    msg.asRaw(),
  );

  try {
    await env.EMAIL.send(message);
  } catch (e) {
    console.error("Error sending confirmation email:", e.message);
  }
}

async function sendEmail(topic, content, env) {
  const msg = createMimeMessage();
  msg.setSender({ name: "Research Agent", addr: env.researcherEmail });
  msg.setRecipient(env.userEmail);
  msg.setSubject(
    `I've found some papers on ${topic} you might be interested in!`,
  );

  const emailHtmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2E86C1; }
          .paper { border: 1px solid #ccc; padding: 20px; margin: 10px 0; border-radius: 8px; }
          .paper-title { font-weight: bold; margin-top: 0; }
          .paper-id { font-size: 0.9em; margin-bottom: 20px; }
          .paper-summary { margin-top: 20px; }
          a { color: #007BFF; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>Research papers on ${topic}</h1>
        ${content}
      </body>
    </html>
  `;

  msg.addMessage({
    contentType: "text/html",
    data: emailHtmlContent,
  });

  const message = new EmailMessage(
    env.researcherEmail,
    env.userEmail,
    msg.asRaw(),
  );

  try {
    await env.EMAIL.send(message);
  } catch (e) {
    console.error("Error sending email:", e.message);
  }
}

async function callArxivAPI(query) {
  console.log(query);
  const response = await fetch(
    `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=1`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const xmlData = await response.text();
  const $ = cheerio.load(xmlData, { xmlMode: true });

  const papers = [];

  $("entry").each(function () {
    const id = $(this).find("id").text().replace("http://arxiv.org/abs/", "");
    const title = $(this).find("title").text().trim();
    const summary = $(this).find("summary").text().trim();

    papers.push({
      id: id,
      title: title,
      summary: summary,
    });
  });
  return papers;
}

class StorageAgent {
  constructor(env) {
    this.env = env;
    this.systemPrompt = `Which research topics are of interest to this user given their message? Start each topic with TOPIC:`;
  }

  async store(message) {
    const { response: topics } = await this.env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct-awq",
      {
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: message },
        ],
      },
    );
    const extractedTopics = topics
      .split("TOPIC:")
      .slice(1)
      .map((topicPart) => topicPart.split("\n")[0]?.trim());

    for (const topic of extractedTopics) {
      const { results } = await this.env.DB.prepare(
        "INSERT INTO topics (topic) VALUES (?) RETURNING *",
      )
        .bind(topic)
        .run();
    }
    return topics;
  }
}

class ResearchAgent {
  constructor(env) {
    this.env = env;
    this.systemPrompt = `Write a short summary that makes this paper easy to understand for the reader.`;
    this.researcher = new Researcher(env);
  }

  async respond(topic) {
    const preparedQueries = await this.researcher.generateQueries(topic);

    const maxQueries = 5;
    const queriesToProcess = preparedQueries.slice(0, maxQueries);

    let searchResults = [];
    for (const query of queriesToProcess) {
      const result = await callArxivAPI(query);
      searchResults.push(...result);
    }

    //Get Llama to simplify. Perhaps unnecessary if you're smart?
    let summaries = [];
    for (const paper of searchResults) {
      const conversation = [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: paper.summary },
      ];
      const { response: aiSummary } = await this.env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct-awq",
        { messages: conversation },
      );
      summaries.push(aiSummary);
    }

    const formattedPapers = searchResults
      .map(
        (paper, index) => `
        <div class="paper">
            <h2 class="paper-title">${paper.title}</h2>
            <p class="paper-id"><a href="http://arxiv.org/abs/${paper.id}" target="_blank">${paper.id}</a></p>
            <p class="paper-summary">${summaries[index]}</p>
        </div>
    `,
      )
      .join("");

    return formattedPapers;
  }
}

class Researcher {
  constructor(env) {
    this.env = env;
    this.systemPrompt = `Prepare short search queries based on the topic that the customer is interested in. Format each query as QUERY:`;
  }

  async generateQueries(message) {
    const { response: queries } = await this.env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct-awq",
      {
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: message },
        ],
      },
    );
    return queries
      .split("QUERY:")
      .slice(1)
      .map((queryPart) => {
        const query = queryPart.split("\n")[0]?.trim();
        // Remove trailing question mark if it exists
        if (query.endsWith("?")) {
          return query.slice(0, -1);
        }
        return query;
      });
  }
}
