/* eslint-disable */
// src/tensor.ts
var TensorType = /* @__PURE__ */ (TensorType2 => {
  TensorType2['String'] = 'str';
  TensorType2['Bool'] = 'bool';
  TensorType2['Float16'] = 'float16';
  TensorType2['Float32'] = 'float32';
  TensorType2['Int16'] = 'int16';
  TensorType2['Int32'] = 'int32';
  TensorType2['Int64'] = 'int64';
  TensorType2['Int8'] = 'int8';
  TensorType2['Uint16'] = 'uint16';
  TensorType2['Uint32'] = 'uint32';
  TensorType2['Uint64'] = 'uint64';
  TensorType2['Uint8'] = 'uint8';
  return TensorType2;
})(TensorType || {});
var TypedArrayProto = Object.getPrototypeOf(Uint8Array);
function isArray(value) {
  return Array.isArray(value) || value instanceof TypedArrayProto;
}
function arrLength(obj) {
  return obj instanceof TypedArrayProto
    ? obj.length
    : obj
        .flat()
        .reduce(
          (acc, cur) => acc + (cur instanceof TypedArrayProto ? cur.length : 1),
          0
        );
}
function ensureShape(shape, value) {
  if (shape.length === 0 && !isArray(value)) {
    return;
  }
  const count = shape.reduce((acc, v) => {
    if (!Number.isInteger(v)) {
      throw new Error(
        `expected shape to be array-like of integers but found non-integer element "${v}"`
      );
    }
    return acc * v;
  }, 1);
  if (count != arrLength(value)) {
    throw new Error(
      `invalid shape: expected ${count} elements for shape ${shape} but value array has length ${value.length}`
    );
  }
}
function ensureType(type, value) {
  if (isArray(value)) {
    value.forEach(v => ensureType(type, v));
    return;
  }
  switch (type) {
    case 'bool' /* Bool */: {
      if (typeof value === 'boolean') {
        return;
      }
      break;
    }
    case 'float16' /* Float16 */:
    case 'float32' /* Float32 */: {
      if (typeof value === 'number') {
        return;
      }
      break;
    }
    case 'int8' /* Int8 */:
    case 'uint8' /* Uint8 */:
    case 'int16' /* Int16 */:
    case 'uint16' /* Uint16 */:
    case 'int32' /* Int32 */:
    case 'uint32' /* Uint32 */: {
      if (Number.isInteger(value)) {
        return;
      }
      break;
    }
    case 'int64' /* Int64 */:
    case 'uint64' /* Uint64 */: {
      if (typeof value === 'bigint') {
        return;
      }
      break;
    }
    case 'str' /* String */: {
      if (typeof value === 'string') {
        return;
      }
      break;
    }
  }
  throw new Error(`unexpected type "${type}" with value "${value}".`);
}
function serializeType(type, value) {
  if (isArray(value)) {
    return [...value].map(v => serializeType(type, v));
  }
  switch (type) {
    case 'str' /* String */:
    case 'bool' /* Bool */:
    case 'float16' /* Float16 */:
    case 'float32' /* Float32 */:
    case 'int8' /* Int8 */:
    case 'uint8' /* Uint8 */:
    case 'int16' /* Int16 */:
    case 'uint16' /* Uint16 */:
    case 'uint32' /* Uint32 */:
    case 'int32' /* Int32 */: {
      return value;
    }
    case 'int64' /* Int64 */:
    case 'uint64' /* Uint64 */: {
      return value.toString();
    }
  }
  throw new Error(`unexpected type "${type}" with value "${value}".`);
}
function deserializeType(type, value) {
  if (isArray(value)) {
    return value.map(v => deserializeType(type, v));
  }
  switch (type) {
    case 'str' /* String */:
    case 'bool' /* Bool */:
    case 'float16' /* Float16 */:
    case 'float32' /* Float32 */:
    case 'int8' /* Int8 */:
    case 'uint8' /* Uint8 */:
    case 'int16' /* Int16 */:
    case 'uint16' /* Uint16 */:
    case 'uint32' /* Uint32 */:
    case 'int32' /* Int32 */: {
      return value;
    }
    case 'int64' /* Int64 */:
    case 'uint64' /* Uint64 */: {
      return BigInt(value);
    }
  }
  throw new Error(`unexpected type "${type}" with value "${value}".`);
}
var Tensor = class _Tensor {
  constructor(type, value, opts = {}) {
    this.type = type;
    this.value = value;
    ensureType(type, this.value);
    if (opts.shape === void 0) {
      if (isArray(this.value)) {
        this.shape = [arrLength(value)];
      } else {
        this.shape = [];
      }
    } else {
      this.shape = opts.shape;
    }
    ensureShape(this.shape, this.value);
    this.name = opts.name || null;
  }
  static fromJSON(obj) {
    const { type, shape, value, b64Value, name } = obj;
    const opts = { shape, name };
    if (b64Value !== void 0) {
      const value2 = b64ToArray(b64Value, type)[0];
      return new _Tensor(type, value2, opts);
    } else {
      return new _Tensor(type, deserializeType(type, value), opts);
    }
  }
  toJSON() {
    return {
      type: this.type,
      shape: this.shape,
      name: this.name,
      value: serializeType(this.type, this.value)
    };
  }
};
function b64ToArray(base64, type) {
  const byteString = atob(base64);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }
  const arrBuffer = new DataView(bytes.buffer).buffer;
  switch (type) {
    case 'float32':
      return new Float32Array(arrBuffer);
    case 'float64':
      return new Float64Array(arrBuffer);
    case 'int32':
      return new Int32Array(arrBuffer);
    case 'int64':
      return new BigInt64Array(arrBuffer);
    default:
      throw Error(`invalid data type for base64 input: ${type}`);
  }
}

// src/session.ts
function parseInputs(inputs) {
  if (Array.isArray(inputs)) {
    return inputs.map(input => input.toJSON());
  }
  if (inputs !== null && typeof inputs === 'object') {
    return Object.keys(inputs).map(key => {
      let tensor = inputs[key].toJSON();
      tensor.name = key;
      return tensor;
    });
  }
  throw new Error(`invalid inputs, must be Array<Tensor<any>> | TensorsObject`);
}
var InferenceSession = class {
  constructor(binding, model, options = {}) {
    this.binding = binding;
    this.model = model;
    this.options = options;
  }
  async run(inputs, options) {
    const jsonInputs = parseInputs(inputs);
    const body = JSON.stringify({
      input: jsonInputs
    });
    const compressedReadableStream = new Response(body).body.pipeThrough(
      new CompressionStream('gzip')
    );
    let routingModel = 'default';
    if (this.model === '@cf/meta/llama-2-7b-chat-int8') {
      routingModel = 'llama_2_7b_chat_int8';
    }
    const res = await this.binding.fetch('/run', {
      method: 'POST',
      body: compressedReadableStream,
      headers: {
        'content-encoding': 'gzip',
        'cf-consn-model-id': this.model,
        'cf-consn-routing-model': routingModel,
        ...(this.options?.extraHeaders || {})
      }
    });
    if (!res.ok) {
      throw new Error(`API returned ${res.status}: ${await res.text()}`);
    }
    const { result } = await res.json();
    const outputByName = {};
    for (let i = 0, len = result.length; i < len; i++) {
      const tensor = Tensor.fromJSON(result[i]);
      const name = tensor.name || 'output' + i;
      outputByName[name] = tensor;
    }
    return outputByName;
  }
};

// src/labels.ts
var resnetLabels = [
  'TENCH',
  'GOLDFISH',
  'WHITE SHARK',
  'TIGER SHARK',
  'HAMMERHEAD SHARK',
  'ELECTRIC RAY',
  'STINGRAY',
  'ROOSTER',
  'HEN',
  'OSTRICH',
  'BRAMBLING',
  'GOLDFINCH',
  'HOUSE FINCH',
  'SNOWBIRD',
  'INDIGO FINCH',
  'ROBIN',
  'BULBUL',
  'JAY',
  'MAGPIE',
  'CHICKADEE',
  'WATER OUZEL',
  'KITE',
  'BALD EAGLE',
  'VULTURE',
  'GREAT GREY OWL',
  'FIRE SALAMANDER',
  'NEWT',
  'EFT',
  'SPOTTED SALAMANDER',
  'AXOLOTL',
  'BULL FROG',
  'TREE FROG',
  'TAILED FROG',
  'LOGGERHEAD',
  'LEATHERBACK TURTLE',
  'MUD TURTLE',
  'TERRAPIN',
  'BOX TURTLE',
  'BANDED GECKO',
  'COMMON IGUANA',
  'AMERICAN CHAMELEON',
  'WHIPTAIL',
  'AGAMA',
  'FRILLED LIZARD',
  'ALLIGATOR LIZARD',
  'GILA MONSTER',
  'GREEN LIZARD',
  'AFRICAN CHAMELEON',
  'KOMODO DRAGON',
  'AFRICAN CROCODILE',
  'AMERICAN ALLIGATOR',
  'TRICERATOPS',
  'THUNDER SNAKE',
  'RINGNECK SNAKE',
  'HOGNOSE SNAKE',
  'GREEN SNAKE',
  'KING SNAKE',
  'GARTER SNAKE',
  'WATER SNAKE',
  'VINE SNAKE',
  'NIGHT SNAKE',
  'BOA',
  'ROCK PYTHON',
  'COBRA',
  'GREEN MAMBA',
  'SEA SNAKE',
  'HORNED VIPER',
  'DIAMONDBACK',
  'SIDEWINDER',
  'TRILOBITE',
  'HARVESTMAN',
  'SCORPION',
  'GARDEN SPIDER',
  'BARN SPIDER',
  'GARDEN SPIDER',
  'BLACK WIDOW',
  'TARANTULA',
  'WOLF SPIDER',
  'TICK',
  'CENTIPEDE',
  'GROUSE',
  'PTARMIGAN',
  'RUFFED GROUSE',
  'PRAIRIE CHICKEN',
  'PEACOCK',
  'QUAIL',
  'PARTRIDGE',
  'AFRICAN GREY',
  'MACAW',
  'COCKATOO',
  'LORIKEET',
  'COUCAL',
  'BEE EATER',
  'HORNBILL',
  'HUMMINGBIRD',
  'JACAMAR',
  'TOUCAN',
  'DRAKE',
  'MERGANSER',
  'GOOSE',
  'BLACK SWAN',
  'TUSKER',
  'ECHIDNA',
  'PLATYPUS',
  'WALLABY',
  'KOALA',
  'WOMBAT',
  'JELLYFISH',
  'SEA ANEMONE',
  'BRAIN CORAL',
  'FLATWORM',
  'NEMATODE',
  'CONCH',
  'SNAIL',
  'SLUG',
  'SEA SLUG',
  'CHITON',
  'CHAMBERED NAUTILUS',
  'DUNGENESS CRAB',
  'ROCK CRAB',
  'FIDDLER CRAB',
  'KING CRAB',
  'AMERICAN LOBSTER',
  'SPINY LOBSTER',
  'CRAYFISH',
  'HERMIT CRAB',
  'ISOPOD',
  'WHITE STORK',
  'BLACK STORK',
  'SPOONBILL',
  'FLAMINGO',
  'LITTLE BLUE HERON',
  'AMERICAN EGRET',
  'BITTERN',
  'CRANE',
  'LIMPKIN',
  'EUROPEAN GALLINULE',
  'AMERICAN COOT',
  'BUSTARD',
  'RUDDY TURNSTONE',
  'RED-BACKED SANDPIPER',
  'REDSHANK',
  'DOWITCHER',
  'OYSTERCATCHER',
  'PELICAN',
  'KING PENGUIN',
  'ALBATROSS',
  'GREY WHALE',
  'KILLER WHALE',
  'DUGONG',
  'SEA LION',
  'CHIHUAHUA',
  'JAPANESE SPANIEL',
  'MALTESE DOG',
  'PEKINESE',
  'SHIH-TZU',
  'BLENHEIM SPANIEL',
  'PAPILLON',
  'TOY TERRIER',
  'RHODESIAN RIDGEBACK',
  'AFGHAN HOUND',
  'BASSET',
  'BEAGLE',
  'BLOODHOUND',
  'BLUETICK',
  'COONHOUND',
  'WALKER HOUND',
  'ENGLISH FOXHOUND',
  'REDBONE',
  'BORZOI',
  'IRISH WOLFHOUND',
  'ITALIAN GREYHOUND',
  'WHIPPET',
  'IBIZAN HOUND',
  'NORWEGIAN ELKHOUND',
  'OTTERHOUND',
  'SALUKI',
  'SCOTTISH DEERHOUND',
  'WEIMARANER',
  'STAFFORDSHIRE BULLTERRIER',
  'STAFFORDSHIRE TERRIER',
  'BEDLINGTON TERRIER',
  'BORDER TERRIER',
  'KERRY BLUE TERRIER',
  'IRISH TERRIER',
  'NORFOLK TERRIER',
  'NORWICH TERRIER',
  'YORKSHIRE TERRIER',
  'WIRE-HAIRED FOX TERRIER',
  'LAKELAND TERRIER',
  'SEALYHAM TERRIER',
  'AIREDALE',
  'CAIRN',
  'AUSTRALIAN TERRIER',
  'DANDIE DINMONT',
  'BOSTON BULL',
  'MINIATURE SCHNAUZER',
  'GIANT SCHNAUZER',
  'STANDARD SCHNAUZER',
  'SCOTCH TERRIER',
  'TIBETAN TERRIER',
  'SILKY TERRIER',
  'WHEATEN TERRIER',
  'WHITE TERRIER',
  'LHASA',
  'RETRIEVER',
  'CURLY-COATED RETRIEVER',
  'GOLDEN RETRIEVER',
  'LABRADOR RETRIEVER',
  'CHESAPEAKE BAY RETRIEVER',
  'SHORT-HAIRED POINTER',
  'VISLA',
  'ENGLISH SETTER',
  'IRISH SETTER',
  'GORDON SETTER',
  'BRITTANY SPANIEL',
  'CLUMBER',
  'ENGLISH SPRINGER',
  'WELSH SPRINGER SPANIEL',
  'COCKER SPANIEL',
  'SUSSEX SPANIEL',
  'IRISH WATERSPANIEL',
  'KUVASZ',
  'SCHIPPERKE',
  'GROENENDAEL',
  'MALINOIS',
  'BRIARD',
  'KELPIE',
  'KOMONDOR',
  'OLD ENGLISH SHEEPDOG',
  'SHETLAND SHEEPDOG',
  'COLLIE',
  'BORDER COLLIE',
  'BOUVIER DES FLANDRES',
  'ROTTWEILER',
  'GERMAN SHEPHERD',
  'DOBERMAN',
  'MINIATURE PINSCHER',
  'GREATER SWISS MOUNTAIN DOG',
  'BERNESE MOUNTAIN DOG',
  'APPENZELLER',
  'ENTLEBUCHER',
  'BOXER',
  'BULL MASTIFF',
  'TIBETAN MASTIFF',
  'FRENCH BULLDOG',
  'GREAT DANE',
  'SAINT BERNARD',
  'ESKIMO DOG',
  'MALAMUTE',
  'SIBERIAN HUSKY',
  'DALMATIAN',
  'AFFENPINSCHER',
  'BASENJI',
  'PUG',
  'LEONBERG',
  'NEWFOUNDLAND',
  'GREAT PYRENEES',
  'SAMOYED',
  'POMERANIAN',
  'CHOW',
  'KEESHOND',
  'BRABANCON GRIFFON',
  'PEMBROKE',
  'CARDIGAN',
  'TOY POODLE',
  'MINIATURE POODLE',
  'STANDARD POODLE',
  'MEXICAN HAIRLESS',
  'TIMBER WOLF',
  'WHITE WOLF',
  'RED WOLF',
  'COYOTE',
  'DINGO',
  'DHOLE',
  'AFRICAN HUNTING DOG',
  'HYENA',
  'RED FOX',
  'KIT FOX',
  'ARCTIC FOX',
  'GREY FOX',
  'TABBY',
  'TIGER CAT',
  'PERSIAN CAT',
  'SIAMESE CAT',
  'EGYPTIAN CAT',
  'COUGAR',
  'LYNX',
  'LEOPARD',
  'SNOW LEOPARD',
  'JAGUAR',
  'LION',
  'TIGER',
  'CHEETAH',
  'BROWN BEAR',
  'AMERICAN BLACK BEAR',
  'ICE BEAR',
  'SLOTH BEAR',
  'MONGOOSE',
  'MEERKAT',
  'TIGER BEETLE',
  'LADYBUG',
  'GROUND BEETLE',
  'LONG-HORNED BEETLE',
  'LEAF BEETLE',
  'DUNG BEETLE',
  'RHINOCEROS BEETLE',
  'WEEVIL',
  'FLY',
  'BEE',
  'ANT',
  'GRASSHOPPER',
  'CRICKET',
  'WALKING STICK',
  'COCKROACH',
  'MANTIS',
  'CICADA',
  'LEAFHOPPER',
  'LACEWING',
  'DRAGONFLY',
  'DAMSELFLY',
  'ADMIRAL',
  'RINGLET',
  'MONARCH',
  'CABBAGE BUTTERFLY',
  'SULPHUR BUTTERFLY',
  'LYCAENID',
  'STARFISH',
  'SEA URCHIN',
  'SEA CUCUMBER',
  'WOOD RABBIT',
  'HARE',
  'ANGORA',
  'HAMSTER',
  'PORCUPINE',
  'FOX SQUIRREL',
  'MARMOT',
  'BEAVER',
  'GUINEA PIG',
  'SORREL',
  'ZEBRA',
  'HOG',
  'WILD BOAR',
  'WARTHOG',
  'HIPPOPOTAMUS',
  'OX',
  'WATER BUFFALO',
  'BISON',
  'RAM',
  'BIGHORN',
  'IBEX',
  'HARTEBEEST',
  'IMPALA',
  'GAZELLE',
  'ARABIAN CAMEL',
  'LLAMA',
  'WEASEL',
  'MINK',
  'POLECAT',
  'BLACK-FOOTED FERRET',
  'OTTER',
  'SKUNK',
  'BADGER',
  'ARMADILLO',
  'THREE-TOED SLOTH',
  'ORANGUTAN',
  'GORILLA',
  'CHIMPANZEE',
  'GIBBON',
  'SIAMANG',
  'GUENON',
  'PATAS',
  'BABOON',
  'MACAQUE',
  'LANGUR',
  'COLOBUS',
  'PROBOSCIS MONKEY',
  'MARMOSET',
  'CAPUCHIN',
  'HOWLER MONKEY',
  'TITI',
  'SPIDER MONKEY',
  'SQUIRREL MONKEY',
  'MADAGASCAR CAT',
  'INDRI',
  'INDIAN ELEPHANT',
  'AFRICAN ELEPHANT',
  'LESSER PANDA',
  'GIANT PANDA',
  'BARRACOUTA',
  'EEL',
  'COHO',
  'ROCK BEAUTY',
  'ANEMONE FISH',
  'STURGEON',
  'GAR',
  'LIONFISH',
  'PUFFER',
  'ABACUS',
  'ABAYA',
  'ACADEMIC GOWN',
  'ACCORDION',
  'ACOUSTIC GUITAR',
  'AIRCRAFT CARRIER',
  'AIRLINER',
  'AIRSHIP',
  'ALTAR',
  'AMBULANCE',
  'AMPHIBIAN',
  'ANALOG CLOCK',
  'APIARY',
  'APRON',
  'ASHCAN',
  'ASSAULT RIFLE',
  'BACKPACK',
  'BAKERY',
  'BALANCE BEAM',
  'BALLOON',
  'BALLPOINT',
  'BAND AID',
  'BANJO',
  'BANNISTER',
  'BARBELL',
  'BARBER CHAIR',
  'BARBERSHOP',
  'BARN',
  'BAROMETER',
  'BARREL',
  'BARROW',
  'BASEBALL',
  'BASKETBALL',
  'BASSINET',
  'BASSOON',
  'BATHING CAP',
  'BATH TOWEL',
  'BATHTUB',
  'BEACH WAGON',
  'BEACON',
  'BEAKER',
  'BEARSKIN',
  'BEER BOTTLE',
  'BEER GLASS',
  'BELL COTE',
  'BIB',
  'BICYCLE-BUILT-FOR-TWO',
  'BIKINI',
  'BINDER',
  'BINOCULARS',
  'BIRDHOUSE',
  'BOATHOUSE',
  'BOBSLED',
  'BOLO TIE',
  'BONNET',
  'BOOKCASE',
  'BOOKSHOP',
  'BOTTLECAP',
  'BOW',
  'BOW TIE',
  'BRASS',
  'BRASSIERE',
  'BREAKWATER',
  'BREASTPLATE',
  'BROOM',
  'BUCKET',
  'BUCKLE',
  'BULLETPROOF VEST',
  'BULLET TRAIN',
  'BUTCHER SHOP',
  'CAB',
  'CALDRON',
  'CANDLE',
  'CANNON',
  'CANOE',
  'CAN OPENER',
  'CARDIGAN',
  'CAR MIRROR',
  'CAROUSEL',
  'CARPENTERS KIT',
  'CARTON',
  'CAR WHEEL',
  'CASH MACHINE',
  'CASSETTE',
  'CASSETTE PLAYER',
  'CASTLE',
  'CATAMARAN',
  'CD PLAYER',
  'CELLO',
  'CELLULAR TELEPHONE',
  'CHAIN',
  'CHAINLINK FENCE',
  'CHAIN MAIL',
  'CHAIN SAW',
  'CHEST',
  'CHIFFONIER',
  'CHIME',
  'CHINA CABINET',
  'CHRISTMAS STOCKING',
  'CHURCH',
  'CINEMA',
  'CLEAVER',
  'CLIFF DWELLING',
  'CLOAK',
  'CLOG',
  'COCKTAIL SHAKER',
  'COFFEE MUG',
  'COFFEEPOT',
  'COIL',
  'COMBINATION LOCK',
  'COMPUTER KEYBOARD',
  'CONFECTIONERY',
  'CONTAINER SHIP',
  'CONVERTIBLE',
  'CORKSCREW',
  'CORNET',
  'COWBOY BOOT',
  'COWBOY HAT',
  'CRADLE',
  'CRANE',
  'CRASH HELMET',
  'CRATE',
  'CRIB',
  'CROCK POT',
  'CROQUET BALL',
  'CRUTCH',
  'CUIRASS',
  'DAM',
  'DESK',
  'DESKTOP COMPUTER',
  'DIAL TELEPHONE',
  'DIAPER',
  'DIGITAL CLOCK',
  'DIGITAL WATCH',
  'DINING TABLE',
  'DISHRAG',
  'DISHWASHER',
  'DISK BRAKE',
  'DOCK',
  'DOGSLED',
  'DOME',
  'DOORMAT',
  'DRILLING PLATFORM',
  'DRUM',
  'DRUMSTICK',
  'DUMBBELL',
  'DUTCH OVEN',
  'ELECTRIC FAN',
  'ELECTRIC GUITAR',
  'ELECTRIC LOCOMOTIVE',
  'ENTERTAINMENT CENTER',
  'ENVELOPE',
  'ESPRESSO MAKER',
  'FACE POWDER',
  'FEATHER BOA',
  'FILE',
  'FIREBOAT',
  'FIRE ENGINE',
  'FIRE SCREEN',
  'FLAGPOLE',
  'FLUTE',
  'FOLDING CHAIR',
  'FOOTBALL HELMET',
  'FORKLIFT',
  'FOUNTAIN',
  'FOUNTAIN PEN',
  'FOUR-POSTER',
  'FREIGHT CAR',
  'FRENCH HORN',
  'FRYING PAN',
  'FUR COAT',
  'GARBAGE TRUCK',
  'GASMASK',
  'GAS PUMP',
  'GOBLET',
  'GO-KART',
  'GOLF BALL',
  'GOLFCART',
  'GONDOLA',
  'GONG',
  'GOWN',
  'GRAND PIANO',
  'GREENHOUSE',
  'GRILLE',
  'GROCERY STORE',
  'GUILLOTINE',
  'HAIR SLIDE',
  'HAIR SPRAY',
  'HALF TRACK',
  'HAMMER',
  'HAMPER',
  'HAND BLOWER',
  'HAND-HELD COMPUTER',
  'HANDKERCHIEF',
  'HARD DISC',
  'HARMONICA',
  'HARP',
  'HARVESTER',
  'HATCHET',
  'HOLSTER',
  'HOME THEATER',
  'HONEYCOMB',
  'HOOK',
  'HOOPSKIRT',
  'HORIZONTAL BAR',
  'HORSE CART',
  'HOURGLASS',
  'IPOD',
  'IRON',
  'JACK-O-LANTERN',
  'JEAN',
  'JEEP',
  'JERSEY',
  'JIGSAW PUZZLE',
  'JINRIKISHA',
  'JOYSTICK',
  'KIMONO',
  'KNEE PAD',
  'KNOT',
  'LAB COAT',
  'LADLE',
  'LAMPSHADE',
  'LAPTOP',
  'LAWN MOWER',
  'LENS CAP',
  'LETTER OPENER',
  'LIBRARY',
  'LIFEBOAT',
  'LIGHTER',
  'LIMOUSINE',
  'LINER',
  'LIPSTICK',
  'LOAFER',
  'LOTION',
  'LOUDSPEAKER',
  'LOUPE',
  'LUMBERMILL',
  'MAGNETIC COMPASS',
  'MAILBAG',
  'MAILBOX',
  'MAILLOT',
  'MAILLOT',
  'MANHOLE COVER',
  'MARACA',
  'MARIMBA',
  'MASK',
  'MATCHSTICK',
  'MAYPOLE',
  'MAZE',
  'MEASURING CUP',
  'MEDICINE CHEST',
  'MEGALITH',
  'MICROPHONE',
  'MICROWAVE',
  'MILITARY UNIFORM',
  'MILK CAN',
  'MINIBUS',
  'MINISKIRT',
  'MINIVAN',
  'MISSILE',
  'MITTEN',
  'MIXING BOWL',
  'MOBILE HOME',
  'MODEL T',
  'MODEM',
  'MONASTERY',
  'MONITOR',
  'MOPED',
  'MORTAR',
  'MORTARBOARD',
  'MOSQUE',
  'MOSQUITO NET',
  'MOTOR SCOOTER',
  'MOUNTAIN BIKE',
  'MOUNTAIN TENT',
  'MOUSE',
  'MOUSETRAP',
  'MOVING VAN',
  'MUZZLE',
  'NAIL',
  'NECK BRACE',
  'NECKLACE',
  'NIPPLE',
  'NOTEBOOK',
  'OBELISK',
  'OBOE',
  'OCARINA',
  'ODOMETER',
  'OIL FILTER',
  'ORGAN',
  'OSCILLOSCOPE',
  'OVERSKIRT',
  'OXCART',
  'OXYGEN MASK',
  'PACKET',
  'PADDLE',
  'PADDLEWHEEL',
  'PADLOCK',
  'PAINTBRUSH',
  'PAJAMA',
  'PALACE',
  'PANPIPE',
  'PAPER TOWEL',
  'PARACHUTE',
  'PARALLEL BARS',
  'PARK BENCH',
  'PARKING METER',
  'PASSENGER CAR',
  'PATIO',
  'PAY-PHONE',
  'PEDESTAL',
  'PENCIL BOX',
  'PENCIL SHARPENER',
  'PERFUME',
  'PETRI DISH',
  'PHOTOCOPIER',
  'PICK',
  'PICKELHAUBE',
  'PICKET FENCE',
  'PICKUP',
  'PIER',
  'PIGGY BANK',
  'PILL BOTTLE',
  'PILLOW',
  'PING-PONG BALL',
  'PINWHEEL',
  'PIRATE',
  'PITCHER',
  'PLANE',
  'PLANETARIUM',
  'PLASTIC BAG',
  'PLATE RACK',
  'PLOW',
  'PLUNGER',
  'POLAROID CAMERA',
  'POLE',
  'POLICE VAN',
  'PONCHO',
  'POOL TABLE',
  'POP BOTTLE',
  'POT',
  'POTTERS WHEEL',
  'POWER DRILL',
  'PRAYER RUG',
  'PRINTER',
  'PRISON',
  'PROJECTILE',
  'PROJECTOR',
  'PUCK',
  'PUNCHING BAG',
  'PURSE',
  'QUILL',
  'QUILT',
  'RACER',
  'RACKET',
  'RADIATOR',
  'RADIO',
  'RADIO TELESCOPE',
  'RAIN BARREL',
  'RECREATIONAL VEHICLE',
  'REEL',
  'REFLEX CAMERA',
  'REFRIGERATOR',
  'REMOTE CONTROL',
  'RESTAURANT',
  'REVOLVER',
  'RIFLE',
  'ROCKING CHAIR',
  'ROTISSERIE',
  'RUBBER ERASER',
  'RUGBY BALL',
  'RULE',
  'RUNNING SHOE',
  'SAFE',
  'SAFETY PIN',
  'SALTSHAKER',
  'SANDAL',
  'SARONG',
  'SAX',
  'SCABBARD',
  'SCALE',
  'SCHOOL BUS',
  'SCHOONER',
  'SCOREBOARD',
  'SCREEN',
  'SCREW',
  'SCREWDRIVER',
  'SEAT BELT',
  'SEWING MACHINE',
  'SHIELD',
  'SHOE SHOP',
  'SHOJI',
  'SHOPPING BASKET',
  'SHOPPING CART',
  'SHOVEL',
  'SHOWER CAP',
  'SHOWER CURTAIN',
  'SKI',
  'SKI MASK',
  'SLEEPING BAG',
  'SLIDE RULE',
  'SLIDING DOOR',
  'SLOT',
  'SNORKEL',
  'SNOWMOBILE',
  'SNOWPLOW',
  'SOAP DISPENSER',
  'SOCCER BALL',
  'SOCK',
  'SOLAR DISH',
  'SOMBRERO',
  'SOUP BOWL',
  'SPACE BAR',
  'SPACE HEATER',
  'SPACE SHUTTLE',
  'SPATULA',
  'SPEEDBOAT',
  'SPIDER WEB',
  'SPINDLE',
  'SPORTS CAR',
  'SPOTLIGHT',
  'STAGE',
  'STEAM LOCOMOTIVE',
  'STEEL ARCH BRIDGE',
  'STEEL DRUM',
  'STETHOSCOPE',
  'STOLE',
  'STONE WALL',
  'STOPWATCH',
  'STOVE',
  'STRAINER',
  'STREETCAR',
  'STRETCHER',
  'STUDIO COUCH',
  'STUPA',
  'SUBMARINE',
  'SUIT',
  'SUNDIAL',
  'SUNGLASS',
  'SUNGLASSES',
  'SUNSCREEN',
  'SUSPENSION BRIDGE',
  'SWAB',
  'SWEATSHIRT',
  'SWIMMING TRUNKS',
  'SWING',
  'SWITCH',
  'SYRINGE',
  'TABLE LAMP',
  'TANK',
  'TAPE PLAYER',
  'TEAPOT',
  'TEDDY',
  'TELEVISION',
  'TENNIS BALL',
  'THATCH',
  'THEATER CURTAIN',
  'THIMBLE',
  'THRESHER',
  'THRONE',
  'TILE ROOF',
  'TOASTER',
  'TOBACCO SHOP',
  'TOILET SEAT',
  'TORCH',
  'TOTEM POLE',
  'TOW TRUCK',
  'TOYSHOP',
  'TRACTOR',
  'TRAILER TRUCK',
  'TRAY',
  'TRENCH COAT',
  'TRICYCLE',
  'TRIMARAN',
  'TRIPOD',
  'TRIUMPHAL ARCH',
  'TROLLEYBUS',
  'TROMBONE',
  'TUB',
  'TURNSTILE',
  'TYPEWRITER KEYBOARD',
  'UMBRELLA',
  'UNICYCLE',
  'UPRIGHT',
  'VACUUM',
  'VASE',
  'VAULT',
  'VELVET',
  'VENDING MACHINE',
  'VESTMENT',
  'VIADUCT',
  'VIOLIN',
  'VOLLEYBALL',
  'WAFFLE IRON',
  'WALL CLOCK',
  'WALLET',
  'WARDROBE',
  'WARPLANE',
  'WASHBASIN',
  'WASHER',
  'WATER BOTTLE',
  'WATER JUG',
  'WATER TOWER',
  'WHISKEY JUG',
  'WHISTLE',
  'WIG',
  'WINDOW SCREEN',
  'WINDOW SHADE',
  'WINDSOR TIE',
  'WINE BOTTLE',
  'WING',
  'WOK',
  'WOODEN SPOON',
  'WOOL',
  'WORM FENCE',
  'WRECK',
  'YAWL',
  'YURT',
  'WEB SITE',
  'COMIC BOOK',
  'CROSSWORD PUZZLE',
  'STREET SIGN',
  'TRAFFIC LIGHT',
  'BOOK JACKET',
  'MENU',
  'PLATE',
  'GUACAMOLE',
  'CONSOMME',
  'HOT POT',
  'TRIFLE',
  'ICE CREAM',
  'ICE LOLLY',
  'FRENCH LOAF',
  'BAGEL',
  'PRETZEL',
  'CHEESEBURGER',
  'HOTDOG',
  'MASHED POTATO',
  'HEAD CABBAGE',
  'BROCCOLI',
  'CAULIFLOWER',
  'ZUCCHINI',
  'SPAGHETTI SQUASH',
  'ACORN SQUASH',
  'BUTTERNUT SQUASH',
  'CUCUMBER',
  'ARTICHOKE',
  'BELL PEPPER',
  'CARDOON',
  'MUSHROOM',
  'GRANNY SMITH',
  'STRAWBERRY',
  'ORANGE',
  'LEMON',
  'FIG',
  'PINEAPPLE',
  'BANANA',
  'JACKFRUIT',
  'CUSTARD APPLE',
  'POMEGRANATE',
  'HAY',
  'CARBONARA',
  'CHOCOLATE SAUCE',
  'DOUGH',
  'MEAT LOAF',
  'PIZZA',
  'POTPIE',
  'BURRITO',
  'RED WINE',
  'ESPRESSO',
  'CUP',
  'EGGNOG',
  'ALP',
  'BUBBLE',
  'CLIFF',
  'CORAL REEF',
  'GEYSER',
  'LAKESIDE',
  'PROMONTORY',
  'SANDBAR',
  'SEASHORE',
  'VALLEY',
  'VOLCANO',
  'BALLPLAYER',
  'GROOM',
  'SCUBA DIVER',
  'RAPESEED',
  'DAISY',
  'LADY SLIPPER',
  'CORN',
  'ACORN',
  'HIP',
  'BUCKEYE',
  'CORAL FUNGUS',
  'AGARIC',
  'GYROMITRA',
  'STINKHORN',
  'EARTHSTAR',
  'HEN-OF-THE-WOODS',
  'BOLETE',
  'EAR',
  'TOILET TISSUE'
];

// src/ai.ts
var modelMappings = {
  'text-classification': ['@cf/huggingface/distilbert-sst-2-int8'],
  'text-embeddings': ['@cf/baai/bge-base-en-v1.5'],
  'speech-recognition': ['@cf/openai/whisper'],
  'image-classification': ['@cf/microsoft/resnet-50'],
  'text-generation': ['@cf/meta/llama-2-7b-chat-int8'],
  translation: ['@cf/meta/m2m100-1.2b']
};
var chunkArray = (arr, size) =>
  arr.length > size
    ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
    : [arr];
var Ai = class {
  constructor(binding, options = {}) {
    this.binding = binding;
    this.options = options;
  }
  async run(model, inputs) {
    const session = new InferenceSession(
      this.binding,
      model,
      this.options.sessionOptions || {}
    );
    let tensorInput;
    let typedInputs;
    let outputMap = r => r;
    const tasks = Object.keys(modelMappings);
    let task = '';
    for (var t in tasks) {
      if (modelMappings[tasks[t]].indexOf(model) !== -1) {
        task = tasks[t];
        break;
      }
    }
    switch (task) {
      case 'text-classification':
        typedInputs = inputs;
        tensorInput = [
          new Tensor('str' /* String */, [typedInputs.text], {
            shape: [[typedInputs.text].length],
            name: 'input_text'
          })
        ];
        outputMap = r => {
          return [
            {
              label: 'NEGATIVE',
              score: r.logits.value[0][0]
            },
            {
              label: 'POSITIVE',
              score: r.logits.value[0][1]
            }
          ];
        };
        break;
      case 'text-embeddings':
        typedInputs = inputs;
        tensorInput = [
          new Tensor(
            'str' /* String */,
            Array.isArray(typedInputs.text)
              ? typedInputs.text
              : [typedInputs.text],
            {
              shape: [
                Array.isArray(typedInputs.text)
                  ? typedInputs.text.length
                  : [typedInputs.text].length
              ],
              name: 'input_text'
            }
          )
        ];
        outputMap = r => {
          if (Array.isArray(r.embeddings.value[0])) {
            return {
              shape: r.embeddings.shape,
              data: r.embeddings.value
            };
          } else {
            return {
              shape: r.embeddings.shape,
              data: chunkArray(r.embeddings.value, r.embeddings.shape[1])
            };
          }
        };
        break;
      case 'speech-recognition':
        typedInputs = inputs;
        tensorInput = [
          new Tensor('uint8' /* Uint8 */, typedInputs.audio, {
            shape: [1, typedInputs.audio.length],
            name: 'audio'
          })
        ];
        outputMap = r => {
          return { text: r.name.value[0] };
        };
        break;
      case 'image-classification':
        typedInputs = inputs;
        tensorInput = [
          new Tensor('uint8' /* Uint8 */, typedInputs.image, {
            shape: [1, typedInputs.image.length],
            name: 'input'
          })
        ];
        outputMap = r => {
          const labels = [];
          const scores = r.output.value[0];
          for (var s in scores)
            labels.push({ label: resnetLabels[s], score: scores[s] });
          labels.sort((a, b) => {
            return b.score - a.score;
          });
          return labels.slice(0, 5);
        };
        break;
      case 'text-generation':
        typedInputs = inputs;
        let prompt = '';
        if (typedInputs.messages === void 0) {
          prompt = typedInputs.prompt;
        } else {
          for (let i = 0; i < typedInputs.messages.length; i++) {
            const inp = typedInputs.messages[i];
            switch (inp.role) {
              case 'system':
                prompt += '[INST]<<SYS>>' + inp.content + '<</SYS>>[/INST]\n';
                break;
              case 'user':
                prompt += '[INST]' + inp.content + '[/INST]\n';
                break;
              case 'assistant':
                prompt += inp.content + '\n';
                break;
              default:
                throw new Error('Invalid role: ' + inp.role);
            }
          }
        }
        tensorInput = [
          new Tensor('str' /* String */, [prompt], {
            shape: [1],
            name: 'INPUT_0'
          }),
          new Tensor('uint32' /* Uint32 */, [256], {
            // sequence length
            shape: [1],
            name: 'INPUT_1'
          })
        ];
        outputMap = r => {
          return { response: r.name.value[0] };
        };
        break;
      case 'translation':
        typedInputs = inputs;
        tensorInput = [
          new Tensor('str' /* String */, [typedInputs.text], {
            shape: [1, 1],
            name: 'text'
          }),
          new Tensor('str' /* String */, [typedInputs.source_lang || 'en'], {
            shape: [1, 1],
            name: 'source_lang'
          }),
          new Tensor('str' /* String */, [typedInputs.target_lang], {
            shape: [1, 1],
            name: 'target_lang'
          })
        ];
        outputMap = r => {
          return { translated_text: r.name.value[0] };
        };
        break;
      default:
        throw new Error(`No such model ${model} or task`);
    }
    const output = await session.run(tensorInput);
    return outputMap(output);
  }
};
export { Ai, InferenceSession, Tensor, TensorType };
