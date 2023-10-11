# Llama Researcher

A demo of a personal research assistant using Cloudflare's Workers AI Llama-2 7b and D1. It demonstrates a simple usecase where an AI agent continuosly researches on your behalf.

There are three main features to this project:

1. You first send an email to the worker (using Workers email routing) explaining topics you are interested in learning about. Llama converts the message to formatted topic labels and stores them in D1.
2. A cron trigger causes a random topic to be retrieved. That topic is converted by the model to several queries which are ultimately used to retrieve researche papers from [https://](https://arxiv.org/)https://arxiv.org/
3. Each paper is summarized be easier to understand (a step that probably is not needed for this API specifically, but possibly useful for other search APIs), formatted and then emailed to you with links to each paper.

There is a decent amount of configuration required to get started:

1. Configure email routing for a domain you have available on Cloudflare https://developers.cloudflare.com/email-routing/get-started/enable-email-routing/
2. Add a custom address (still in the email routing section) that points to this worker. In wrangler.toml this is the variable researcherEmail.
3. Add your personal email as a destination address. In wrangler.toml this is the userEmail variable
4. Create a new D1 database "wrangler d1 create researcher" and database table "wrangler d1 execute researcher --command "CREATE TABLE IF NOT EXISTS topics (id INTEGER PRIMARY KEY, topic TEXT NOT NULL)"
5. Fill in wrangler.toml with the required emails and database ID. Optionally change the cron trigger.

Get started by sending an email to the researcher email you configured. Describe practically any topic you're interested in that might be found on https://arxiv.org/. The format of this email does not matter.
If everything is set up you'll receive a confirmation email describing the topics llama ultimately picked. In the Cloudflare dashboard you can check exactly how the topics are stored

Test the cron trigger https://developers.cloudflare.com/workers/configuration/cron-triggers/:
wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"

The model will convert the topic to several additional queries, search for a recent paper with each query, summarize the paper and send you an email with all of the results!
