import React, { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/Firebase-temp";
import { toast } from "react-toastify";

import E2EE from "../../lib/e2ee";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { resolveMediaUrl, uploadVideoWithProgress, formatFileSize, isVideoFile } from "../../lib/mediaVault";

const EMOJI_CATEGORIES = [
  {
    id: "smileys",
    name: "Smileys & Emotion",
    icon: "😀",
    emojis: [
      { char: "😀", keywords: "grinning face happy smile joy" },
      { char: "😃", keywords: "grinning face big eyes happy smile" },
      { char: "😄", keywords: "grinning face smiling eyes happy joy" },
      { char: "😁", keywords: "beaming face smiling eyes grin teeth" },
      { char: "😆", keywords: "grinning squinting laughing lol haha" },
      { char: "😅", keywords: "grinning sweat cold smile phew" },
      { char: "😂", keywords: "tears of joy laugh lol haha rofl" },
      { char: "🤣", keywords: "rolling on floor laughing lol rofl haha" },
      { char: "🥲", keywords: "smiling tear grateful bittersweet" },
      { char: "🥹", keywords: "holding back tears plead touched emotional" },
      { char: "😊", keywords: "smiling blushing warm happy cute" },
      { char: "😇", keywords: "innocent angel halo holy" },
      { char: "🙂", keywords: "slightly smiling face ok fine" },
      { char: "🙃", keywords: "upside down silly sarcasm irony" },
      { char: "😉", keywords: "winking face flirt wink playful" },
      { char: "😌", keywords: "relieved peaceful calm content" },
      { char: "😍", keywords: "heart eyes love crush adore romantic" },
      { char: "🥰", keywords: "smiling heart face love affection cute" },
      { char: "😘", keywords: "kissing heart blow kiss love mwah" },
      { char: "😗", keywords: "kissing face whistle" },
      { char: "😙", keywords: "kissing face smiling eyes" },
      { char: "😚", keywords: "kissing face closed eyes" },
      { char: "😋", keywords: "delicious tongue yummy food tasty" },
      { char: "😛", keywords: "tongue out silly playful" },
      { char: "😝", keywords: "squinting tongue lol silly fun" },
      { char: "😜", keywords: "winking tongue crazy wink joke" },
      { char: "🤪", keywords: "zany crazy goofy wild" },
      { char: "🤨", keywords: "raised eyebrow skepticism suspicious suspect" },
      { char: "🧐", keywords: "monocle curious inspect detective look" },
      { char: "🤓", keywords: "nerd geek glasses smart" },
      { char: "😎", keywords: "sunglasses cool boss style swag" },
      { char: "🥸", keywords: "disguise glasses mustache incognito" },
      { char: "🤩", keywords: "star struck excited amazed wow" },
      { char: "🥳", keywords: "partying face celebrate horn bday birthday party" },
      { char: "😏", keywords: "smirking sly flirt suggestive" },
      { char: "😒", keywords: "unamused annoyed bored" },
      { char: "😞", keywords: "disappointed sad down" },
      { char: "😔", keywords: "pensive thoughtful sad regret" },
      { char: "😟", keywords: "worried concerned nervous" },
      { char: "😕", keywords: "confused puzzled" },
      { char: "🙁", keywords: "slightly frowning sad" },
      { char: "☹️", keywords: "frowning face unhappy sad" },
      { char: "😣", keywords: "persevering struggle upset" },
      { char: "😖", keywords: "confounded distraught helpless" },
      { char: "😫", keywords: "tired exhausted weary groan" },
      { char: "😩", keywords: "weary fed up stressed" },
      { char: "🥺", keywords: "pleading puppy eyes please beg cute" },
      { char: "😢", keywords: "crying sad tear upset" },
      { char: "😭", keywords: "loudly crying sob tears overwhelmed" },
      { char: "😮‍💨", keywords: "face exhaling sigh relief" },
      { char: "😤", keywords: "huffing triumph proud angry smoke" },
      { char: "😠", keywords: "angry mad annoyed furious" },
      { char: "😡", keywords: "pouting rage angry red mad" },
      { char: "🤬", keywords: "symbols swearing cursing anger rage" },
      { char: "🤯", keywords: "exploding head mind blown shock amaze" },
      { char: "😳", keywords: "flushed embarrassed wide eyes shock" },
      { char: "🥵", keywords: "hot face sweat summer fever" },
      { char: "🥶", keywords: "cold face freezing frost ice" },
      { char: "😱", keywords: "screaming fear horror shock terrified" },
      { char: "😨", keywords: "fearful scared frightened" },
      { char: "😰", keywords: "anxious sweat blue worry" },
      { char: "😥", keywords: "sad relieved sweat phew" },
      { char: "😓", keywords: "downcast sweat stress hard work" },
      { char: "🫣", keywords: "peeking eye hide nervous look" },
      { char: "🫢", keywords: "hand over mouth oops gasping" },
      { char: "🫡", keywords: "saluting salute respect yes sir" },
      { char: "🤫", keywords: "shushing quiet secret shh" },
      { char: "🫠", keywords: "melting hot dissolve embarrassed" },
      { char: "🤥", keywords: "lying pinocchio long nose lie" },
      { char: "😶", keywords: "no mouth silent quiet speechlessness" },
      { char: "😐", keywords: "neutral poker face blank whatever" },
      { char: "😑", keywords: "expressionless deadpan unbothered" },
      { char: "😬", keywords: "grimacing awkward oof teeth cringe" },
      { char: "🫨", keywords: "shaking vibrating shock quake" },
      { char: "😮", keywords: "open mouth wow surprise gasp" },
      { char: "😯", keywords: "hushed stunned surprise" },
      { char: "😲", keywords: "astonished amazed shocked" },
      { char: "🥱", keywords: "yawning tired sleepy bored" },
      { char: "😴", keywords: "sleeping zzz bedtime rest" },
      { char: "🤤", keywords: "drooling craving delicious sleepy" },
      { char: "😪", keywords: "sleepy snot bubble tired" },
      { char: "😵", keywords: "dizzy dead knocked out" },
      { char: "😵‍💫", keywords: "spiral eyes dizzy confused vertigo" },
      { char: "🤐", keywords: "zipper mouth quiet sealed secret" },
      { char: "🥴", keywords: "woozy drunk tipsy dizzy" },
      { char: "🤢", keywords: "nauseated sick green disgusted" },
      { char: "🤮", keywords: "vomiting puking sick disgust" },
      { char: "🤧", keywords: "sneezing tissue cold allergy" },
      { char: "😷", keywords: "medical mask sick virus flu" },
      { char: "🤒", keywords: "thermometer sick unwell fever" },
      { char: "🤕", keywords: "bandage hurt injured head" },
      { char: "🤑", keywords: "money mouth rich cash dollar" },
      { char: "🤠", keywords: "cowboy hat western sheriff yeehaw" },
      { char: "😈", keywords: "smiling devil purple evil mischievous" },
      { char: "👿", keywords: "angry imp devil wicked" },
      { char: "👹", keywords: "ogre monster red mask japanese" },
      { char: "👺", keywords: "goblin long nose mask" },
      { char: "🤡", keywords: "clown circus funny joke" },
      { char: "💩", keywords: "poop pile crap funny poo" },
      { char: "👻", keywords: "ghost spooky halloween boo" },
      { char: "💀", keywords: "skull dead skeleton lol dying" },
      { char: "☠️", keywords: "skull and crossbones danger poison pirate" },
      { char: "👽", keywords: "alien ufo extraterrestrial space" },
      { char: "👾", keywords: "space invader alien retro game" },
      { char: "🤖", keywords: "robot bot ai tech mechanical" },
      { char: "🎃", keywords: "jack o lantern pumpkin halloween spooky" },
    ],
  },
  {
    id: "gestures",
    name: "Hands & People",
    icon: "👋",
    emojis: [
      { char: "👋", keywords: "waving hand wave hello hi bye goodbye" },
      { char: "🤚", keywords: "raised back of hand stop" },
      { char: "🖐️", keywords: "hand splayed five fingers high five" },
      { char: "✋", keywords: "raised hand high five stop" },
      { char: "🖖", keywords: "vulcan salute live long prosper star trek" },
      { char: "🫱", keywords: "rightwards hand reach" },
      { char: "🫲", keywords: "leftwards hand reach" },
      { char: "🫳", keywords: "palm down drop hand" },
      { char: "🫴", keywords: "palm up offer invite receive" },
      { char: "👌", keywords: "ok hand perfect agree good nice" },
      { char: "🤌", keywords: "pinched fingers italian chef kiss what" },
      { char: "🤏", keywords: "pinching hand tiny small little bit" },
      { char: "✌️", keywords: "victory hand peace two v" },
      { char: "🤞", keywords: "crossed fingers luck wish hope" },
      { char: "🫰", keywords: "hand with index and thumb crossed korean finger heart love cash" },
      { char: "🤟", keywords: "love you gesture ily hand sign rock" },
      { char: "🤘", keywords: "sign of horns rock on metal cool" },
      { char: "🤙", keywords: "call me shaka phone hang loose bro" },
      { char: "👈", keywords: "backhand index pointing left point" },
      { char: "👉", keywords: "backhand index pointing right point" },
      { char: "👆", keywords: "backhand index pointing up upvote" },
      { char: "🖕", keywords: "middle finger rude gesture" },
      { char: "👇", keywords: "backhand index pointing down downvote here" },
      { char: "☝️", keywords: "index pointing up one first listen" },
      { char: "👍", keywords: "thumbs up approve like yes good agree" },
      { char: "👎", keywords: "thumbs down dislike no bad disagree" },
      { char: "✊", keywords: "raised fist punch power solid" },
      { char: "👊", keywords: "oncoming fist brofist bump hit" },
      { char: "🤛", keywords: "left facing fist bump" },
      { char: "🤜", keywords: "right facing fist bump" },
      { char: "👏", keywords: "clapping hands applause bravo good job" },
      { char: "🙌", keywords: "raising hands praise hooray celebration" },
      { char: "🫶", keywords: "heart hands love adore care" },
      { char: "👐", keywords: "open hands embrace hug" },
      { char: "🤲", keywords: "palms up together pray dua hope" },
      { char: "🤝", keywords: "handshake deal agreement partner meet" },
      { char: "🙏", keywords: "folded hands please pray thank you thanks namaste" },
      { char: "✍️", keywords: "writing hand write signature note pencil" },
      { char: "💅", keywords: "nail polish slay sassy glam manicure" },
      { char: "🤳", keywords: "selfie camera phone photo" },
      { char: "💪", keywords: "flexed biceps strong muscle workout power gym" },
      { char: "🦾", keywords: "mechanical arm prosthetic bionic cyborg" },
      { char: "🦿", keywords: "mechanical leg prosthetic" },
      { char: "🦵", keywords: "leg limb kick" },
      { char: "🦶", keywords: "foot feet step toes" },
      { char: "👂", keywords: "ear listen hear sound" },
      { char: "🦻", keywords: "ear with hearing aid deaf audio" },
      { char: "👃", keywords: "nose smell sniff aroma" },
      { char: "🧠", keywords: "brain think smart intelligence genius" },
      { char: "🫀", keywords: "anatomical heart organ cardio health" },
      { char: "🫁", keywords: "lungs breathing breath health" },
      { char: "🦷", keywords: "tooth dentist teeth smile dental" },
      { char: "🦴", keywords: "bone skeleton dog treat" },
      { char: "👀", keywords: "eyes look seeing curious watch inspect" },
      { char: "👁️", keywords: "eye vision look watch see" },
      { char: "👅", keywords: "tongue taste lick playful" },
      { char: "👄", keywords: "mouth lips kiss lipstick sexy" },
      { char: "💋", keywords: "kiss mark lips romance love sexy" },
      { char: "🫂", keywords: "people hugging hug comfort embrace support" },
      { char: "🧑", keywords: "person human adult someone" },
      { char: "👶", keywords: "baby infant child cute" },
      { char: "🧒", keywords: "child kid boy girl" },
      { char: "👦", keywords: "boy young male student" },
      { char: "👧", keywords: "girl young female kid" },
      { char: "👩", keywords: "woman female adult lady" },
      { char: "👨", keywords: "man male adult gentleman" },
      { char: "👴", keywords: "old man grandpa grandfather elder" },
      { char: "👵", keywords: "old woman grandma grandmother elder" },
      { char: "🙍", keywords: "person frowning upset" },
      { char: "🙎", keywords: "person pouting grumpy" },
      { char: "🙅", keywords: "person gesturing no decline stop" },
      { char: "🙆", keywords: "person gesturing ok approve good" },
      { char: "💁", keywords: "tipping hand information help sassy" },
      { char: "🙋", keywords: "raising hand question volunteer pick me" },
      { char: "🧏", keywords: "deaf person listen hear" },
      { char: "🙇", keywords: "person bowing apologize respect thanks" },
      { char: "🤦", keywords: "person facepalming smh frustration disbelief" },
      { char: "🤷", keywords: "person shrugging idk shrug whatever doubt" },
      { char: "👨‍💻", keywords: "man technologist coder developer programmer hacker" },
      { char: "👩‍💻", keywords: "woman technologist coder software developer" },
      { char: "👨‍💼", keywords: "man office worker business suit corporate" },
      { char: "👩‍💼", keywords: "woman office worker business manager executive" },
      { char: "👨‍🎨", keywords: "man artist painter creative art" },
      { char: "👩‍🎨", keywords: "woman artist painter creative" },
      { char: "👨‍🚀", keywords: "astronaut space rocket cosmonaut" },
      { char: "👩‍🚀", keywords: "woman astronaut space flight" },
    ],
  },
  {
    id: "hearts",
    name: "Hearts & Symbols",
    icon: "❤️",
    emojis: [
      { char: "❤️", keywords: "red heart love romance passion favorite like" },
      { char: "🧡", keywords: "orange heart warmth care friendship" },
      { char: "💛", keywords: "yellow heart happiness friendship pure gold" },
      { char: "💚", keywords: "green heart nature eco envy health" },
      { char: "💙", keywords: "blue heart trust peace loyalty cool" },
      { char: "💜", keywords: "purple heart royalty love magic fancy" },
      { char: "🖤", keywords: "black heart dark gothic sorrow edgy" },
      { char: "🤍", keywords: "white heart pure innocent clean angel" },
      { char: "🤎", keywords: "brown heart earth chocolate warm" },
      { char: "💔", keywords: "broken heart heartbreak sad sorrow breakup" },
      { char: "❤️‍🔥", keywords: "heart on fire burning passionate desire" },
      { char: "❤️‍🩹", keywords: "mending heart healing recovery better" },
      { char: "❣️", keywords: "heart exclamation punctuation excitement love" },
      { char: "💕", keywords: "two hearts love floating affection" },
      { char: "💞", keywords: "revolving hearts revolving romance" },
      { char: "💓", keywords: "beating heart pulse heartbeat nervous excited" },
      { char: "💗", keywords: "growing heart expand love admiration" },
      { char: "💖", keywords: "sparkling heart shine glitter adore magical" },
      { char: "💘", keywords: "heart with arrow cupid struck crush valentine" },
      { char: "💝", keywords: "heart with ribbon gift present love bow" },
      { char: "💟", keywords: "heart decoration purple badge" },
      { char: "💯", keywords: "hundred points 100 percent perfect score true" },
      { char: "✨", keywords: "sparkles shiny magical stars clean glow new" },
      { char: "⭐", keywords: "star favorite rating gold yellow" },
      { char: "🌟", keywords: "glowing star shine burst sparkle bright" },
      { char: "⚡", keywords: "high voltage lightning bolt electricity power thunder flash" },
      { char: "🔥", keywords: "fire flame lit hot trend trending heat" },
      { char: "💥", keywords: "collision boom explosion bang pow" },
      { char: "🎉", keywords: "party popper celebration tada congrats congratulations celebrate" },
      { char: "🎊", keywords: "confetti ball party celebrate yay" },
      { char: "🎈", keywords: "balloon birthday party celebration red" },
      { char: "🎁", keywords: "wrapped gift present box surprise birthday" },
      { char: "🏆", keywords: "trophy champion award winner first prize 1st" },
      { char: "🥇", keywords: "1st place medal gold winner champion" },
      { char: "🥈", keywords: "2nd place medal silver second" },
      { char: "🥉", keywords: "3rd place medal bronze third" },
      { char: "🔒", keywords: "locked padlock secure privacy safe key security" },
      { char: "🔑", keywords: "key unlock password secret clue access" },
      { char: "🔔", keywords: "bell notification alert reminder ring sound" },
      { char: "💡", keywords: "light bulb idea smart thought genius electric" },
      { char: "💎", keywords: "gem stone diamond precious luxury expensive crystal" },
      { char: "💰", keywords: "money bag dollar rich cash wealth payment" },
      { char: "💵", keywords: "dollar banknote cash money payment bills" },
      { char: "💳", keywords: "credit card banking payment purchase debit" },
      { char: "✅", keywords: "check mark green button verify done correct" },
      { char: "❌", keywords: "cross mark red x cancel wrong delete" },
      { char: "⚠️", keywords: "warning sign alert caution hazard notice" },
      { char: "🚀", keywords: "rocket ship launch blast off fast growth speed" },
    ],
  },
  {
    id: "animals",
    name: "Animals & Nature",
    icon: "🐶",
    emojis: [
      { char: "🐶", keywords: "dog face puppy pet animal friend cute bark" },
      { char: "🐱", keywords: "cat face kitty kitten pet animal meow cute" },
      { char: "🐭", keywords: "mouse face rodent animal small cute" },
      { char: "🐹", keywords: "hamster pet animal cute rodent" },
      { char: "🐰", keywords: "rabbit face bunny easter pet animal" },
      { char: "🦊", keywords: "fox face animal clever wildlife orange" },
      { char: "🐻", keywords: "bear animal wild grizzly brown" },
      { char: "🐼", keywords: "panda bear animal china bamboo cute" },
      { char: "🐻‍❄️", keywords: "polar bear arctic animal ice" },
      { char: "🐨", keywords: "koala australia animal cute marsupial" },
      { char: "🐯", keywords: "tiger face animal wild stripes roar" },
      { char: "🦁", keywords: "lion face king wild roar animal mane" },
      { char: "🐮", keywords: "cow face farm dairy cattle animal milk" },
      { char: "🐷", keywords: "pig face pork farm animal oink" },
      { char: "🐸", keywords: "frog toad amphibian green ribbit" },
      { char: "🐵", keywords: "monkey face animal jungle playful banana" },
      { char: "🙈", keywords: "see no evil monkey shy hide embarrassed" },
      { char: "🙉", keywords: "hear no evil monkey loud quiet" },
      { char: "🙊", keywords: "speak no evil monkey secret quiet oops" },
      { char: "🐒", keywords: "monkey animal jungle" },
      { char: "🐔", keywords: "chicken hen bird poultry farm rooster" },
      { char: "🐧", keywords: "penguin bird arctic cold cute tux" },
      { char: "🐦", keywords: "bird blue avian tweet fly animal" },
      { char: "🐤", keywords: "baby chick yellow bird young cute" },
      { char: "🐣", keywords: "hatching chick easter egg baby" },
      { char: "🐥", keywords: "front facing baby chick bird young" },
      { char: "🦆", keywords: "duck bird mallard quack pond" },
      { char: "🦅", keywords: "eagle bird predator raptor freedom usa" },
      { char: "🦉", keywords: "owl bird night wisdom wise nocturnal" },
      { char: "🐺", keywords: "wolf animal wild howl pack moon" },
      { char: "🦄", keywords: "unicorn magical fantasy rainbow horse horn" },
      { char: "🐝", keywords: "honeybee bee insect honey buzz bug" },
      { char: "🦋", keywords: "butterfly insect wings pretty nature bug" },
      { char: "🐢", keywords: "turtle reptile shell slow tortoise" },
      { char: "🐍", keywords: "snake reptile serpent python slither" },
      { char: "🐙", keywords: "octopus ocean sea creature tentacles" },
      { char: "🐬", keywords: "dolphin ocean sea mammal swim smart" },
      { char: "🐳", keywords: "spouting whale ocean sea marine huge" },
      { char: "🦈", keywords: "shark ocean sea predator fish teeth" },
      { char: "🕊️", keywords: "dove bird peace olive branch fly hope" },
      { char: "🌸", keywords: "cherry blossom flower sakura pink spring floral" },
      { char: "🌹", keywords: "rose flower red romantic love valentine floral" },
      { char: "🌻", keywords: "sunflower yellow blossom summer floral sunshine" },
      { char: "🌺", keywords: "hibiscus tropical flower floral hawaii" },
      { char: "🌷", keywords: "tulip blossom flower spring floral" },
      { char: "🌱", keywords: "seedling sprout plant grow nature green" },
      { char: "🌲", keywords: "evergreen tree pine forest nature christmas" },
      { char: "🌳", keywords: "deciduous tree nature plant wood green" },
      { char: "🌴", keywords: "palm tree tropical beach summer vacation island" },
      { char: "🍀", keywords: "four leaf clover lucky st patrick fortune" },
      { char: "☀️", keywords: "sun bright sunshine summer warm weather day" },
      { char: "🌈", keywords: "rainbow colors nature sky pride rain" },
      { char: "🌊", keywords: "water wave ocean surf tsunami sea" },
    ],
  },
  {
    id: "food",
    name: "Food & Drink",
    icon: "🍕",
    emojis: [
      { char: "🍎", keywords: "red apple fruit healthy sweet food" },
      { char: "🍌", keywords: "banana fruit yellow potassium food" },
      { char: "🍉", keywords: "watermelon fruit summer sweet slice" },
      { char: "🍇", keywords: "grapes fruit vine wine purple" },
      { char: "🍓", keywords: "strawberry fruit berry sweet red" },
      { char: "🍒", keywords: "cherries fruit berry pair red" },
      { char: "🍑", keywords: "peach fruit sweet juicy booty butt" },
      { char: "🥭", keywords: "mango tropical fruit sweet delicious" },
      { char: "🍍", keywords: "pineapple tropical fruit hawaii sweet" },
      { char: "🥑", keywords: "avocado fruit healthy guac toast keto" },
      { char: "🍅", keywords: "tomato vegetable salad ketchup red" },
      { char: "🌶️", keywords: "hot pepper chili spicy flavor red" },
      { char: "🌽", keywords: "ear of corn maze vegetable pop farm" },
      { char: "🥐", keywords: "croissant bakery pastry bread french breakfast" },
      { char: "🍞", keywords: "bread loaf bakery toast sandwich" },
      { char: "🧀", keywords: "cheese wedge cheddar dairy snack swiss" },
      { char: "🍳", keywords: "cooking egg fry skillet breakfast yolk pan" },
      { char: "🥞", keywords: "pancakes breakfast syrup butter brunch hotcakes" },
      { char: "🥓", keywords: "bacon breakfast meat pork crispy strips" },
      { char: "🥩", keywords: "cut of meat steak beef raw butcher bbq" },
      { char: "🍗", keywords: "poultry leg chicken drumstick roast meat" },
      { char: "🍔", keywords: "hamburger burger fast food diner cheeseburger beef" },
      { char: "🍟", keywords: "french fries fast food potato chips salty" },
      { char: "🍕", keywords: "pizza slice cheese pepperoni italian fast food" },
      { char: "🥪", keywords: "sandwich bread lunch deli sub" },
      { char: "🌮", keywords: "taco mexican fast food tortilla" },
      { char: "🌯", keywords: "burrito mexican wrap food roll" },
      { char: "🥗", keywords: "green salad healthy vegetable diet bowl" },
      { char: "🍝", keywords: "spaghetti pasta noodle italian tomato sauce" },
      { char: "🍜", keywords: "steaming bowl ramen noodles soup broth asian" },
      { char: "🍛", keywords: "curry rice spicy food indian japanese dinner" },
      { char: "🍣", keywords: "sushi raw fish japanese sashimi roll" },
      { char: "🥟", keywords: "dumpling potsticker dim sum gyoza asian" },
      { char: "🍦", keywords: "soft ice cream cone vanilla dessert sweet dairy" },
      { char: "🍧", keywords: "shaved ice dessert sweet syrup shaved" },
      { char: "🍨", keywords: "ice cream sundae bowl dessert sweet" },
      { char: "🍩", keywords: "doughnut donut bakery sweet dessert glaze sprinkles" },
      { char: "🍪", keywords: "cookie biscuit chocolate chip bakery dessert" },
      { char: "🎂", keywords: "birthday cake celebrate anniversary party candle sweet" },
      { char: "🍰", keywords: "shortcake slice dessert sweet bakery strawberry" },
      { char: "🍫", keywords: "chocolate bar candy sweet cacao dessert treat" },
      { char: "🍿", keywords: "popcorn cinema movie theater snack butter" },
      { char: "☕", keywords: "hot beverage coffee tea espresso morning cafe mug" },
      { char: "🫖", keywords: "teapot tea kettle drink brew" },
      { char: "🍵", keywords: "teacup matcha green tea drink asian" },
      { char: "🧃", keywords: "beverage box juice box carton drink straw" },
      { char: "🥤", keywords: "cup with straw soda drink soft drink beverage" },
      { char: "🧋", keywords: "bubble tea boba milk tea drink pearls" },
      { char: "🍺", keywords: "beer mug alcohol pub drink toast cheers pint" },
      { char: "🍻", keywords: "clinking beer mugs cheers party pub alcohol" },
      { char: "🥂", keywords: "clinking glasses champagne toast cheers celebration party" },
      { char: "🍷", keywords: "wine glass alcohol red drink bar dine" },
      { char: "🍹", keywords: "tropical drink cocktail summer beach cocktail" },
    ],
  },
  {
    id: "activities",
    name: "Activities & Travel",
    icon: "⚽",
    emojis: [
      { char: "⚽", keywords: "soccer ball football sport game play fifa" },
      { char: "🏀", keywords: "basketball sport ball hoop nba play" },
      { char: "🏈", keywords: "american football sport nfl ball play" },
      { char: "⚾", keywords: "baseball sport mlb ball pitch" },
      { char: "🎾", keywords: "tennis ball sport racket play match" },
      { char: "🏐", keywords: "volleyball sport beach ball match" },
      { char: "🎱", keywords: "pool 8 ball billiards game eight ball" },
      { char: "🏓", keywords: "ping pong table tennis paddle ball sport" },
      { char: "🏸", keywords: "badminton racket shuttlecock sport match" },
      { char: "🥊", keywords: "boxing glove fight punch combat sport knockout" },
      { char: "🥋", keywords: "martial arts uniform karate judo taekwondo gi" },
      { char: "🛹", keywords: "skateboard skate board street ride trick" },
      { char: "🏋️", keywords: "person lifting weights gym bodybuilding fitness crossfit workout" },
      { char: "🧘", keywords: "person in lotus position yoga meditation zen calm peace" },
      { char: "🚴", keywords: "person biking cycling bike ride cycle bicycle" },
      { char: "🎮", keywords: "video game controller gaming playstation xbox switch gamer" },
      { char: "🕹️", keywords: "joystick arcade retro gaming game" },
      { char: "🎲", keywords: "game die dice board games gamble random roll" },
      { char: "🎭", keywords: "performing arts theater mask drama comedy acting" },
      { char: "🎨", keywords: "artist palette art painting color draw museum" },
      { char: "🎬", keywords: "clapper board movie film cinema director production action" },
      { char: "🎤", keywords: "microphone sing music karaoke concert audio voice" },
      { char: "🎧", keywords: "headphone audio music listen sound podcast beats" },
      { char: "🎼", keywords: "musical score notes sheet song melody harmony" },
      { char: "🎹", keywords: "musical keyboard piano keys play music concert" },
      { char: "🥁", keywords: "drum stick beat rhythm percussion music" },
      { char: "🎷", keywords: "saxophone jazz music brass instrument song" },
      { char: "🎺", keywords: "trumpet horn brass music fanfare sound" },
      { char: "🎸", keywords: "guitar acoustic electric rock music instrument strings" },
      { char: "🎻", keywords: "violin classical music orchestra strings bow" },
      { char: "🚗", keywords: "automobile car red drive transport travel road" },
      { char: "🚕", keywords: "taxi cab uber yellow transport ride" },
      { char: "🚙", keywords: "sport utility vehicle suv car travel drive blue" },
      { char: "🚌", keywords: "bus public transport transit coach school" },
      { char: "🏎️", keywords: "racing car f1 formula fast race speed motorsport" },
      { char: "🚓", keywords: "police car cop emergency patrol law sirens" },
      { char: "🚑", keywords: "ambulance emergency vehicle medical hospital rescue" },
      { char: "🚒", keywords: "fire engine truck emergency rescue firefighter" },
      { char: "✈️", keywords: "airplane flight travel aviation airport trip vacation fly" },
      { char: "🛫", keywords: "airplane departure takeoff flight leave fly" },
      { char: "🛬", keywords: "airplane arrival landing fly trip return arrive" },
      { char: "🚀", keywords: "rocket blastoff space launch fast cosmos orbit" },
      { char: "🚁", keywords: "helicopter chopper flight rotor air travel" },
      { char: "⛵", keywords: "sailboat boat sea ocean wind sail water" },
      { char: "🚤", keywords: "speedboat boat fast water marine lake" },
      { char: "🚢", keywords: "ship cruise passenger boat transport sea ocean" },
      { char: "🏖️", keywords: "beach with umbrella tropical sand sea ocean summer relax" },
      { char: "🏝️", keywords: "desert island tropical beach tree sea vacation" },
      { char: "⛰️", keywords: "mountain nature climb peak hike landscape outdoors" },
      { char: "🏕️", keywords: "camping tent outdoors nature forest campfire" },
    ],
  },
];

const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap((c) =>
  c.emojis.map((e) => ({ ...e, categoryId: c.id, categoryName: c.name }))
);

const QUICK_REACTIONS = ["❤️", "👍", "😂", "🔥", "🎉", "🙏", "😮", "😢", "✨", "🚀", "💯", "😍"];

const VoiceMessagePlayer = ({
  src,
  isOwn,
  msg,
  convertTimestamp,
  formatFullTimestamp,
  getTickClassName,
  getTickIcon,
}) => {
  const audioRef = useRef(null);
  const trackRef = useRef(null);
  const playerIdRef = useRef(Math.random().toString(36).substring(2, 9));

  const [playableSrc, setPlayableSrc] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => {
    const rawDur = Number(msg?.audioDuration || msg?.duration);
    return isFinite(rawDur) && rawDur > 0 ? rawDur : 0;
  });
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Convert Base64 / Data URLs to Blob URLs for optimal browser streaming & seeking
  useEffect(() => {
    let active = true;
    let createdObjectUrl = null;

    if (!src || typeof src !== "string") {
      setPlayableSrc("");
      return;
    }

    if (src.startsWith("data:")) {
      try {
        const parts = src.split(",");
        const header = parts[0] || "";
        const mimeMatch = header.match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "audio/webm";
        const b64Data = parts[1];

        if (b64Data) {
          const byteCharacters = atob(b64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mime });
          createdObjectUrl = URL.createObjectURL(blob);
          if (active) {
            setPlayableSrc(createdObjectUrl);
          }
        } else {
          if (active) setPlayableSrc(src);
        }
      } catch (err) {
        console.warn("Error creating Blob URL from Data URL:", err);
        if (active) setPlayableSrc(src);
      }
    } else if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("blob:")) {
      if (active) setPlayableSrc(src);
    } else {
      // Raw base64 string fallback
      try {
        const byteCharacters = atob(src);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "audio/webm" });
        createdObjectUrl = URL.createObjectURL(blob);
        if (active) {
          setPlayableSrc(createdObjectUrl);
        }
      } catch (rawErr) {
        console.warn("Raw base64 conversion failed:", rawErr);
        if (active) setPlayableSrc(src);
      }
    }

    return () => {
      active = false;
      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [src]);

  // Sync duration if passed in msg or resolve via AudioContext
  useEffect(() => {
    const rawDur = Number(msg?.audioDuration || msg?.duration);
    if (isFinite(rawDur) && rawDur > 0) {
      setDuration(rawDur);
      return;
    }

    if (!playableSrc) return;

    let isMounted = true;
    let audioCtx = null;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
        fetch(playableSrc)
          .then((res) => res.arrayBuffer())
          .then((buf) => audioCtx.decodeAudioData(buf))
          .then((decoded) => {
            if (isMounted && decoded && isFinite(decoded.duration) && decoded.duration > 0) {
              setDuration(decoded.duration);
            }
          })
          .catch((decodeErr) => {
            console.warn("Audio duration fetch info:", decodeErr);
          })
          .finally(() => {
            if (audioCtx && audioCtx.state !== "closed") {
              audioCtx.close().catch(() => {});
            }
          });
      }
    } catch (err) {
      console.warn("AudioContext decode error:", err);
    }

    return () => {
      isMounted = false;
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    };
  }, [playableSrc, msg?.audioDuration, msg?.duration]);

  // Pause when other audio in chat plays
  useEffect(() => {
    const handleOtherAudio = (e) => {
      if (e.detail?.id !== playerIdRef.current && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener("chatapp-audio-play", handleOtherAudio);
    return () => {
      window.removeEventListener("chatapp-audio-play", handleOtherAudio);
    };
  }, []);

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    if (dur && isFinite(dur) && dur > 0) {
      setDuration(dur);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    if ((!duration || !isFinite(duration) || duration <= 0) && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlay = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    window.dispatchEvent(
      new CustomEvent("chatapp-audio-play", { detail: { id: playerIdRef.current } })
    );

    // Reset to beginning if track ended
    if (audio.ended || (duration > 0 && audio.currentTime >= duration - 0.2)) {
      audio.currentTime = 0;
      setCurrentTime(0);
    }

    setIsLoading(true);
    setHasError(false);

    try {
      if (audio.readyState === 0) {
        audio.load();
      }
      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (err) {
      console.warn("Audio play promise failed, attempting safe load and retry:", err);
      try {
        audio.load();
        await new Promise((resolve) => {
          const onCanPlay = () => {
            audio.removeEventListener("canplay", onCanPlay);
            resolve();
          };
          audio.addEventListener("canplay", onCanPlay);
          setTimeout(resolve, 800);
        });
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
      } catch (playErr) {
        console.error("Audio playback error:", playErr);
        setIsPlaying(false);
        setIsLoading(false);
        setHasError(true);
        toast.error("Audio playback failed");
      }
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const seekTime = Number(e.target.value);
    if (audioRef.current && isFinite(seekTime)) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleTrackClick = (e) => {
    if (!duration || !isFinite(duration) || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percent * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const cyclePlaybackRate = (e) => {
    e.stopPropagation();
    const rates = [1, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const formatTime = (timeInSec) => {
    if (!timeInSec || isNaN(timeInSec) || !isFinite(timeInSec) || timeInSec < 0) return "0:00";
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const waveHeights = [
    35, 65, 25, 80, 55, 40, 75, 50, 95, 70, 35, 65, 80, 45, 60, 30, 90, 65, 50, 75, 40, 60, 35, 70,
  ];

  const currentProgress = duration > 0 && isFinite(duration) ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  return (
    <div className={`voice-msg-player ${isOwn ? "own-voice" : "other-voice"} ${isPlaying ? "playing" : ""}`}>
      <audio
        ref={audioRef}
        src={playableSrc}
        preload="auto"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
        onCanPlay={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (audioRef.current) audioRef.current.currentTime = 0;
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />

      <button
        type="button"
        className={`voice-play-btn ${isLoading ? "loading" : ""} ${hasError ? "error" : ""}`}
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
      >
        {isLoading ? (
          <div className="voice-btn-spinner" />
        ) : isPlaying ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="4" width="4" height="16" rx="1.5" />
            <rect x="15" y="4" width="4" height="16" rx="1.5" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}>
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        )}
      </button>

      <div className="voice-content-col">
        <div className="voice-track-wrap" onClick={handleTrackClick} ref={trackRef}>
          <input
            type="range"
            min="0"
            max={duration > 0 && isFinite(duration) ? duration : 100}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="voice-scrubber"
            aria-label="Audio timeline"
          />
          <div className="voice-waveform-bars" aria-hidden="true">
            {waveHeights.map((h, i) => {
              const barProgress = i / waveHeights.length;
              const isActive = currentProgress >= barProgress;
              return (
                <span
                  key={i}
                  className={`wave-bar ${isActive ? "active" : ""}`}
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
        </div>

        <div className="voice-meta-row">
          <div className="voice-meta-left">
            <span className="voice-time">
              {isPlaying
                ? formatTime(currentTime)
                : duration > 0
                ? formatTime(duration)
                : formatTime(currentTime)}
            </span>

            <button
              type="button"
              className={`voice-mute-btn ${isMuted ? "muted" : ""}`}
              onClick={toggleMute}
              title={isMuted ? "Unmute audio" : "Mute audio"}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="m9 9 3-3v12l-5-4H3V10h4l2-2Z" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>

            {isPlaying && (
              <button
                type="button"
                className="voice-speed-pill"
                onClick={cyclePlaybackRate}
                title="Change playback speed"
              >
                {playbackRate}x
              </button>
            )}
          </div>

          <span className="msg-bottom inline">
            <span className={getTickClassName(msg)}>{getTickIcon(msg)}</span>
            <span className="msg-time" title={formatFullTimestamp(msg.createdAt)}>
              {convertTimestamp(msg.createdAt)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

const VideoMessagePlayer = ({
  src,
  isOwn,
  msg,
  convertTimestamp,
  formatFullTimestamp,
  getTickClassName,
  getTickIcon,
  onOpenLightbox,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [playableSrc, setPlayableSrc] = useState(src || "");
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  useEffect(() => {
    let active = true;
    if (!src) {
      setPlayableSrc("");
      return;
    }
    if (
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("blob:") ||
      src.startsWith("data:")
    ) {
      setPlayableSrc(src);
      return;
    }

    setIsLoadingMedia(true);
    resolveMediaUrl(src)
      .then((resolved) => {
        if (active) {
          setPlayableSrc(resolved || src);
          setIsLoadingMedia(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to resolve video src:", err);
        if (active) {
          setPlayableSrc(src);
          setIsLoadingMedia(false);
        }
      });

    return () => {
      active = false;
    };
  }, [src]);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Video play error:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (!duration && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (dur && !isNaN(dur) && isFinite(dur)) {
        setDuration(dur);
      }
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const seekTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (timeInSec) => {
    if (!timeInSec || isNaN(timeInSec) || !isFinite(timeInSec)) return "0:00";
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`video-msg-player ${isOwn ? "own-video" : "other-video"} ${isPlaying ? "is-playing" : ""} ${isControlsVisible ? "show-controls" : ""}`}
      onMouseEnter={() => setIsControlsVisible(true)}
      onMouseLeave={() => setIsControlsVisible(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={playableSrc}
        preload="metadata"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        className="video-player-element"
      />

      {/* Buffering/Loading Overlay */}
      {isLoadingMedia && (
        <div className="video-buffering-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="video-buffer-spinner" />
          <span>Loading video...</span>
        </div>
      )}

      {/* Center Play Button Overlay */}
      {!isPlaying && !isLoadingMedia && (
        <div className="video-center-overlay" onClick={togglePlay}>
          <button
            type="button"
            className="video-center-play-btn"
            aria-label="Play video"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}>
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </button>
        </div>
      )}

      {/* Top Header Badge */}
      <div className="video-top-bar" onClick={(e) => e.stopPropagation()}>
        <span className="video-badge-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect width="14" height="14" x="1" y="5" rx="2" ry="2" />
          </svg>
          <span>{duration > 0 ? formatTime(duration) : "Video"}</span>
        </span>
        {onOpenLightbox && (
          <button
            type="button"
            className="video-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox({ type: "video", url: playableSrc || src });
            }}
            title="Expand Fullscreen"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="video-bottom-controls" onClick={(e) => e.stopPropagation()}>
        <div className="video-scrubber-track">
          <input
            type="range"
            min="0"
            max={duration > 0 ? duration : 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="video-scrubber-input"
            aria-label="Video seek slider"
          />
          <div
            className="video-scrubber-progress"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="video-controls-actions">
          <div className="video-actions-left">
            <button
              type="button"
              className="video-small-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="4" width="4" height="16" rx="1" />
                  <rect x="15" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              )}
            </button>
            <span className="video-time-indicator">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="video-actions-right">
            <button
              type="button"
              className="video-small-btn"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="m9 9 3-3v12l-5-4H3V10h4l2-2Z" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Timestamp */}
      <span className="video-floating-time">
        <span className={getTickClassName(msg)}>{getTickIcon(msg)}</span>
        <span className="msg-time" title={formatFullTimestamp(msg.createdAt)}>
          {convertTimestamp(msg.createdAt)}
        </span>
      </span>
    </div>
  );
};

const PhotoMessageCard = ({
  src,
  isOwn,
  msg,
  convertTimestamp,
  formatFullTimestamp,
  getTickClassName,
  getTickIcon,
  onOpenLightbox,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="photo-msg-card"
      onClick={() => onOpenLightbox({ type: "image", url: src, createdAt: msg.createdAt, isOwn })}
      title="Click to view full photo"
    >
      {!isLoaded && !hasError && (
        <div className="photo-skeleton-loader">
          <div className="photo-spinner"></div>
        </div>
      )}

      {hasError ? (
        <div className="photo-error-fallback">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <line x1="21" y1="21" x2="9" y2="9" />
          </svg>
          <span>Failed to load photo</span>
        </div>
      ) : (
        <img
          src={src}
          alt="Shared photo"
          loading="lazy"
          className={`photo-img-element ${isLoaded ? "loaded" : "loading"}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* Top Header Overlay */}
      <div className="photo-top-overlay" onClick={(e) => e.stopPropagation()}>
        <span className="photo-badge-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span>Photo</span>
        </span>
        <button
          type="button"
          className="photo-expand-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox({ type: "image", url: src, createdAt: msg.createdAt, isOwn });
          }}
          title="Open in Fullscreen Viewer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      </div>

      {/* Floating Bottom Timestamp */}
      <span className="photo-floating-time">
        <span className={getTickClassName(msg)}>{getTickIcon(msg)}</span>
        <span className="msg-time" title={formatFullTimestamp(msg.createdAt)}>
          {convertTimestamp(msg.createdAt)}
        </span>
      </span>
    </div>
  );
};

const parseBusinessMessage = (msg) => {
  if (!msg) return null;

  if (msg.businessData && msg.templateType) {
    return {
      templateType: msg.templateType,
      ...msg.businessData,
      attachments: msg.attachments || [],
    };
  }

  const text = msg.text || "";
  if (!text) return null;

  const isInvoice = text.includes("INVOICE") || text.includes("Invoice #:");
  const isNotice = text.includes("NOTICE") && (text.includes("Subject:") || text.includes("From:"));
  const isData = text.includes("DATA UPDATE") || (text.includes("Reference:") && text.includes("From:"));

  if (!isInvoice && !isNotice && !isData && msg.messageType !== "business") {
    return null;
  }

  const getField = (prefix) => {
    const regex = new RegExp(`^${prefix}\\s*:\\s*(.+)$`, "im");
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

  if (isInvoice || msg.templateType === "invoice") {
    const from = getField("From") || msg.senderCompany || "Business";
    const to = getField("To") || "";
    const invoiceNumber = getField("Invoice #") || getField("Invoice Number") || "INV-001";
    const date = getField("Date") || "";
    const total = getField("Total") || getField("Amount") || "0.00";
    const status = getField("Status") || "Pending";

    let items = "";
    const itemsMatch = text.match(/Items:\s*\n?([\s\S]*?)(?=\n-{3,}|\nTotal:|$)/i);
    if (itemsMatch) {
      items = itemsMatch[1].trim();
    } else {
      items = getField("Items") || "Services rendered";
    }

    return {
      templateType: "invoice",
      companyName: from,
      recipientName: to,
      invoiceNumber,
      date,
      items,
      amount: total,
      status,
      attachments: msg.attachments || [],
    };
  }

  if (isNotice || msg.templateType === "notice") {
    const from = getField("From") || msg.senderCompany || "Business";
    const to = getField("To") || "";
    const subject = getField("Subject") || "Important Notice";
    const date = getField("Date") || "";

    let messageBody = "";
    const msgMatch = text.match(/Subject:.*?\n-{3,}\n([\s\S]*?)(?=\n-{3,}|\nDate:|$)/i);
    if (msgMatch) {
      messageBody = msgMatch[1].trim();
    } else {
      const parts = text.split(/-------------------/);
      messageBody = parts.length >= 3 ? parts[2].trim() : text;
    }

    return {
      templateType: "notice",
      companyName: from,
      recipientName: to,
      subject,
      message: messageBody,
      date,
      attachments: msg.attachments || [],
    };
  }

  if (isData || msg.templateType === "data") {
    const from = getField("From") || msg.senderCompany || "Business";
    const to = getField("To") || "";
    const reference = getField("Reference") || "N/A";
    const date = getField("Date") || "";

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const title =
      lines[1] && !lines[1].startsWith("---") && !lines[1].startsWith("From:")
        ? lines[1]
        : getField("Title") || "Information Update";

    let content = "";
    const dataMatch = text.match(/DATA UPDATE[\s\S]*?-{3,}\n([\s\S]*?)(?=\n-{3,}|\nReference:|$)/i);
    if (dataMatch) {
      content = dataMatch[1].trim();
    } else {
      content = text;
    }

    return {
      templateType: "data",
      companyName: from,
      recipientName: to,
      title,
      content,
      reference,
      date,
      attachments: msg.attachments || [],
    };
  }

  return null;
};

const BusinessMessageCard = ({
  msg,
  isOwn,
  convertTimestamp,
  formatFullTimestamp,
  getTickClassName,
  getTickIcon,
  onOpenLightbox,
}) => {
  const [copied, setCopied] = useState(false);
  const business = parseBusinessMessage(msg);
  if (!business) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(msg.text || "");
    setCopied(true);
    toast.success("Details copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = (e) => {
    e.stopPropagation();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print receipt");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${business.templateType === "invoice" ? "Invoice " + (business.invoiceNumber || "") : "Business Notice"}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 540px; margin: 0 auto; line-height: 1.5; }
            .header { border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .company { font-size: 22px; font-weight: 700; color: #0f172a; }
            .type { font-size: 12px; text-transform: uppercase; font-weight: 700; color: #6366f1; letter-spacing: 0.5px; margin-top: 3px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; background: #f8fafc; padding: 14px; border-radius: 8px; }
            .label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .val { font-size: 13.5px; font-weight: 600; color: #0f172a; margin-top: 2px; }
            .items-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; white-space: pre-wrap; font-size: 13.5px; }
            .total-box { background: #f1f5f9; border-radius: 8px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .badge-paid { background: #d1fae5; color: #065f46; }
            .badge-pending { background: #fef3c7; color: #92400e; }
            .badge-overdue { background: #fee2e2; color: #991b1b; }
            .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">${business.companyName || "Business"}</div>
              <div class="type">${business.templateType === "invoice" ? "Official Invoice" : business.templateType === "notice" ? "Official Notice" : "Data Report"}</div>
            </div>
            ${business.status ? `<div class="badge badge-${business.status.toLowerCase()}">${business.status}</div>` : ""}
          </div>
          <div class="grid">
            ${business.invoiceNumber ? `<div><div class="label">Invoice #</div><div class="val">${business.invoiceNumber}</div></div>` : ""}
            ${business.date ? `<div><div class="label">Date</div><div class="val">${business.date}</div></div>` : ""}
            ${business.recipientName ? `<div><div class="label">Billed To</div><div class="val">${business.recipientName}</div></div>` : ""}
            ${business.reference && business.reference !== "N/A" ? `<div><div class="label">Reference</div><div class="val">${business.reference}</div></div>` : ""}
          </div>
          ${business.subject ? `<div style="margin-bottom: 12px; font-size: 14px;"><strong>Subject:</strong> ${business.subject}</div>` : ""}
          <div class="items-box">
            ${business.items || business.message || business.content || "N/A"}
          </div>
          ${business.amount ? `
            <div class="total-box">
              <span>Total Amount:</span>
              <span style="color: #6366f1;">${business.amount}</span>
            </div>
          ` : ""}
          <div class="footer">Thank you for your business! • Generated from MOCOSN CHAT</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") {
      return (
        <span className="biz-badge paid">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          PAID
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="biz-badge pending">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          PENDING
        </span>
      );
    }
    if (s === "overdue") {
      return (
        <span className="biz-badge overdue">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          OVERDUE
        </span>
      );
    }
    return (
      <span className="biz-badge draft">{status || "OFFICIAL"}</span>
    );
  };

  return (
    <div className={`biz-card ${business.templateType} ${isOwn ? "own-biz" : "other-biz"}`}>
      {/* Top Header Row */}
      <div className="biz-card-top">
        <div className="biz-top-info">
          <div className="biz-icon-pill">
            {business.templateType === "invoice" ? "📄" : business.templateType === "notice" ? "📢" : "📊"}
          </div>
          <div className="biz-title-wrap">
            <span className="biz-name">{business.companyName || "Business"}</span>
            <span className="biz-sub">
              {business.templateType === "invoice"
                ? `Invoice ${business.invoiceNumber ? `#${business.invoiceNumber}` : ""}`
                : business.templateType === "notice"
                ? "Official Announcement"
                : "Report & Analytics"}
              {business.date ? ` • ${business.date}` : ""}
            </span>
          </div>
        </div>
        {business.status && getStatusBadge(business.status)}
      </div>

      {/* Hero Amount (For Invoices) */}
      {business.templateType === "invoice" && (
        <div className="biz-amount-hero">
          <span className="biz-amount-val">{business.amount}</span>
          <span className="biz-amount-lbl">
            {business.status?.toLowerCase() === "paid" ? "Paid in full" : "Total amount due"}
          </span>
        </div>
      )}

      {/* Perforated Divider */}
      <div className="biz-divider">
        <div className="biz-divider-line" />
      </div>

      {/* Key Details Rows */}
      <div className="biz-details-list">
        {business.recipientName && (
          <div className="biz-detail-item">
            <span className="biz-d-lbl">Billed To</span>
            <span className="biz-d-val">{business.recipientName}</span>
          </div>
        )}

        {business.reference && business.reference !== "N/A" && (
          <div className="biz-detail-item">
            <span className="biz-d-lbl">Reference</span>
            <span className="biz-d-val code">{business.reference}</span>
          </div>
        )}

        {business.subject && (
          <div className="biz-detail-item full-width">
            <span className="biz-d-lbl">Subject</span>
            <span className="biz-d-val bold">{business.subject}</span>
          </div>
        )}
      </div>

      {/* Main Content / Items description */}
      <div className="biz-body-box">
        {business.templateType === "invoice" ? (
          <div className="biz-items-wrap">
            <span className="biz-body-lbl">Services & Items:</span>
            <p className="biz-body-text">{business.items || "Services rendered"}</p>
          </div>
        ) : business.templateType === "notice" ? (
          <div className="biz-notice-wrap">
            <p className="biz-body-text">{business.message}</p>
          </div>
        ) : (
          <div className="biz-data-wrap">
            {business.title && <span className="biz-data-title">{business.title}</span>}
            <p className="biz-body-text">{business.content}</p>
          </div>
        )}
      </div>

      {/* Attachments Area */}
      {business.attachments && business.attachments.length > 0 && (
        <div className="biz-media-area">
          <span className="biz-media-lbl">📎 Attached Media ({business.attachments.length})</span>
          <div className="biz-media-grid">
            {business.attachments.map((att, idx) => {
              const isImg =
                att.type === "image" ||
                att.mimeType?.startsWith("image/") ||
                /\.(png|jpe?g|webp|gif)$/i.test(att.name || att.url);
              const isVid =
                att.type === "video" ||
                att.mimeType?.startsWith("video/") ||
                /\.(mp4|webm|mov)$/i.test(att.name || att.url);

              return (
                <div key={idx} className="biz-media-cell">
                  {isImg ? (
                    <div
                      className="biz-media-img-wrap"
                      onClick={() =>
                        onOpenLightbox &&
                        onOpenLightbox({
                          type: "image",
                          url: att.url,
                          createdAt: msg.createdAt,
                          isOwn,
                        })
                      }
                    >
                      <img src={att.url} alt={att.name || "Attachment"} loading="lazy" />
                      <div className="biz-media-overlay">
                        <span>🔍 {att.name || "Photo"}</span>
                      </div>
                    </div>
                  ) : isVid ? (
                    <div
                      className="biz-media-vid-wrap"
                      onClick={() =>
                        onOpenLightbox &&
                        onOpenLightbox({
                          type: "video",
                          url: att.url,
                          createdAt: msg.createdAt,
                          isOwn,
                        })
                      }
                    >
                      <video src={att.url} preload="metadata" />
                      <div className="biz-media-overlay">
                        <span>▶ {att.name || "Video"}</span>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="biz-file-pill"
                    >
                      <span>📄</span>
                      <span className="biz-file-name">{att.name || "Document"}</span>
                      <span>⬇</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Card Actions & Footer */}
      <div className="biz-footer">
        <div className="biz-btn-row">
          <button type="button" className="biz-action-btn" onClick={handleCopy}>
            {copied ? "✓ Copied" : "📋 Copy"}
          </button>
          {business.templateType === "invoice" && (
            <button type="button" className="biz-action-btn print" onClick={handlePrint}>
              🖨️ Receipt
            </button>
          )}
        </div>

        <div className="biz-time-row">
          <span className="biz-note">
            {business.templateType === "invoice" ? "Thank you!" : "Official"}
          </span>
          <span className="biz-time">
            <span className={getTickClassName(msg)}>{getTickIcon(msg)}</span>
            <span title={formatFullTimestamp(msg.createdAt)}>
              {convertTimestamp(msg.createdAt)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

const ChatBox = () => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxRotation, setLightboxRotation] = useState(0);

  const handleOpenLightbox = async (media) => {
    setLightboxZoom(1);
    setLightboxRotation(0);
    if (media?.type === "video" && media.url) {
      try {
        const resolved = await resolveMediaUrl(media.url);
        setLightboxMedia({ ...media, url: resolved || media.url });
      } catch (e) {
        setLightboxMedia(media);
      }
    } else {
      setLightboxMedia(media);
    }
  };
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState("smileys");
  const [emojiSearchQuery, setEmojiSearchQuery] = useState("");
  const [recentEmojis, setRecentEmojis] = useState(() => {
    try {
      const saved = localStorage.getItem("MOCOSN_CHAT_recent_emojis");
      return saved ? JSON.parse(saved) : ["❤️", "👍", "😂", "😍", "🔥", "🙏", "🎉", "✨", "🙌", "😊"];
    } catch (err) {
      console.warn("Failed to load recent emojis from storage:", err);
      return ["❤️", "👍", "😂", "😍", "🔥", "🙏", "🎉", "✨", "🙌", "😊"];
    }
  });

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? input.length;
      const end = textarea.selectionEnd ?? input.length;
      const updated = input.substring(0, start) + emoji + input.substring(end);
      setInput(updated);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = start + emoji.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
      }, 0);
    } else {
      setInput((prev) => prev + emoji);
    }

    setRecentEmojis((prev) => {
      const filtered = prev.filter((e) => e !== emoji);
      const next = [emoji, ...filtered].slice(0, 28);
      try {
        localStorage.setItem("MOCOSN_CHAT_recent_emojis", JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const [showBusinessPanel, setShowBusinessPanel] = useState(false);
  const [businessTemplate, setBusinessTemplate] = useState("invoice");
  const [invoiceAttachments, setInvoiceAttachments] = useState([]);
  const [videoUpload, setVideoUpload] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingDurationRef = useRef(0);
  const recordingTimerRef = useRef(null);
  const shouldSendAudioRef = useRef(true);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const isFirstLoad = useRef(true);
  const sendingRef = useRef(false);
  const textareaRef = useRef(null);

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisible,
    chatData,
    setRightSidebarVisible,
  } = useContext(AppContext);

  const scrollToBottom = (behavior = "smooth") => {
    const el = messagesEndRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior, block: "end" });
    });
  };

  const updateChatLastMessage = async (lastMessageText) => {
    if (!chatUser) return;

    const userIDs = [chatUser.rId, userData.id];
    for (const id of userIDs) {
      try {
        const userChatsRef = doc(db, "chats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (!userChatsSnapshot.exists()) continue;

        const userChatData = userChatsSnapshot.data();
        const chatIndex = userChatData.chatsData.findIndex(
          (c) => c.messagesId === messagesId
        );

        if (chatIndex === -1) continue;

        userChatData.chatsData[chatIndex].lastMessage = lastMessageText.slice(0, 30);
        userChatData.chatsData[chatIndex].updatedAt = Date.now();

        if (userChatData.chatsData[chatIndex].rId === userData.id) {
          userChatData.chatsData[chatIndex].messageSeen = false;
        } else {
          userChatData.chatsData[chatIndex].messageSeen = true;
        }

        await updateDoc(userChatsRef, {
          chatsData: userChatData.chatsData,
        });
      } catch (error) {
        console.error("Failed to update chat last message for user", id, error);
      }
    }
  };

  const sendMessage = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || !messagesId || !chatUser || sendingRef.current) return;
    sendingRef.current = true;

    try {
      const e2eePayload = await (async () => {
        try {
          const recipientDoc = await getDoc(doc(db, "users", chatUser.rId));
          if (recipientDoc.exists() && recipientDoc.data()?.publicKey) {
            return await E2EE.encrypt(textToSend, recipientDoc.data().publicKey);
          }
        } catch (e2eeError) {
          console.warn("E2EE encrypt failed, sending plaintext fallback:", e2eeError);
        }
        return null;
      })();

      const messageData = {
        sId: userData.id,
        createdAt: new Date(),
        status: "sent",
        ...(e2eePayload ? { e2ee: e2eePayload } : { text: textToSend }),
      };

      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion(messageData),
      });

      updateChatLastMessage(textToSend).catch((err) => {
        console.error("Failed to update chat last message:", err);
      });

      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      toast.error("Failed to send message: " + error.message);
    } finally {
      sendingRef.current = false;
    }
  };

  const handleSendVideo = async (file) => {
    if (!file || !messagesId || !chatUser) return;

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(`Video exceeds 50MB limit (${formatFileSize(file.size)})`);
      return;
    }

    if (videoUpload) {
      toast.warning("Another video is currently uploading. Please wait.");
      return;
    }

    const abortController = new AbortController();
    let localPreviewUrl = "";
    try {
      localPreviewUrl = URL.createObjectURL(file);
    } catch (e) {
      console.warn("Could not create object url for preview:", e);
    }

    const uploadState = {
      id: `vid_up_${Date.now()}`,
      name: file.name || "video.mp4",
      size: file.size,
      formattedSize: formatFileSize(file.size),
      previewUrl: localPreviewUrl,
      progress: 5,
      stage: "uploading",
      statusText: "Uploading video... 5%",
      abortController,
    };

    setVideoUpload(uploadState);
    scrollToBottom("smooth");

    try {
      const videoUrl = await uploadVideoWithProgress(
        file,
        ({ percent, loaded, total, stage }) => {
          setVideoUpload((prev) => {
            if (!prev) return null;
            let statusText = `Uploading ${percent}%...`;
            if (stage === "saving") statusText = `Saving video ${percent}%...`;
            if (percent >= 100) statusText = "Finalizing video...";
            return {
              ...prev,
              progress: percent,
              stage,
              statusText,
              loadedFormatted: formatFileSize(loaded),
            };
          });
        },
        abortController.signal
      );

      if (videoUrl && messagesId) {
        const messageData = {
          sId: userData.id,
          video: videoUrl,
          createdAt: new Date(),
          status: "sent",
          ...(userData.accountType === "business" ? { messageType: "media" } : {}),
        };

        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion(messageData),
        });

        updateChatLastMessage("Video").catch((err) => {
          console.error("Failed to update chat last message:", err);
        });

        toast.success("Video sent successfully!");
      }
    } catch (error) {
      if (error.message?.includes("aborted") || error.message?.includes("cancelled")) {
        toast.info("Video upload cancelled");
      } else {
        console.error("Video send error:", error);
        toast.error("Failed to send video: " + error.message);
      }
    } finally {
      setVideoUpload(null);
      scrollToBottom("smooth");
    }
  };

  const cancelVideoUpload = () => {
    if (videoUpload?.abortController) {
      videoUpload.abortController.abort();
    }
    setVideoUpload(null);
  };

  const sendImage = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (e.target) e.target.value = "";
      if (!file) return;

      if (!messagesId || !chatUser) {
        toast.error("Please select a conversation to send media");
        return;
      }

      if (isVideoFile(file)) {
        await handleSendVideo(file);
        return;
      }

      const fileUrl = await uploadToCloudinary(file);

      if (fileUrl && messagesId) {
        const messageData = {
          sId: userData.id,
          image: fileUrl,
          createdAt: new Date(),
          status: "sent",
          ...(userData.accountType === "business" ? { messageType: "media" } : {}),
        };

        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion(messageData),
        });

        updateChatLastMessage("Image").catch((err) => {
          console.error("Failed to update chat last message:", err);
        });
      }
    } catch (error) {
      toast.error("Failed to send media: " + error.message);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = "";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        }
      }

      const recorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      shouldSendAudioRef.current = true;
      recordingDurationRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        const recordedSecs = recordingDurationRef.current || 1;
        setRecordingDuration(0);
        recordingDurationRef.current = 0;
        stream.getTracks().forEach((track) => track.stop());

        if (shouldSendAudioRef.current && audioChunksRef.current.length > 0) {
          const recordedMime = mediaRecorder.mimeType || mimeType || "audio/webm";
          const audioBlob = new Blob(audioChunksRef.current, { type: recordedMime });
          if (audioBlob.size > 0) {
            const extension = recordedMime.includes("mp4") ? "mp4" : recordedMime.includes("ogg") ? "ogg" : "webm";
            const audioFile = new File([audioBlob], `voice_note_${Date.now()}.${extension}`, { type: recordedMime });
            await sendAudio(audioFile, recordedSecs);
          }
        }
      };

      mediaRecorder.start(200); // 200ms timeslices ensure audio chunks are captured reliably
      setIsRecording(true);
      setRecordingDuration(0);
      recordingDurationRef.current = 0;

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        recordingDurationRef.current += 1;
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Microphone access denied or unavailable");
    }
  };

  const stopAndSendRecording = () => {
    shouldSendAudioRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.requestData();
        }
      } catch (err) {
        console.warn("requestData error before stop:", err);
      }
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    shouldSendAudioRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingDuration(0);
    recordingDurationRef.current = 0;
    toast.info("Voice recording cancelled");
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopAndSendRecording();
    } else {
      await startRecording();
    }
  };

  const sendAudio = async (audioFile, audioDurationSecs = 0) => {
    if (!messagesId || !chatUser || sendingRef.current) return;
    sendingRef.current = true;

    try {
      const fileUrl = await uploadToCloudinary(audioFile);

      if (fileUrl && messagesId) {
        const messageData = {
          sId: userData.id,
          audio: fileUrl,
          audioDuration: audioDurationSecs || 0,
          createdAt: new Date(),
          status: "sent",
        };

        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion(messageData),
        });

        updateChatLastMessage("🎤 Voice message").catch((err) => {
          console.error("Failed to update chat last message:", err);
        });
      }
    } catch (error) {
      console.error("Failed to send audio:", error);
      toast.error("Failed to send audio: " + error.message);
    } finally {
      sendingRef.current = false;
    }
  };

  const sendBusinessMessage = async (templateType, data, attachments = []) => {
    if (!messagesId || !chatUser || sendingRef.current) return;
    sendingRef.current = true;

    try {
      let messageText = "";
      let messageType = "business";

      if (templateType === "invoice") {
        messageText = `📄 INVOICE\n\n` +
          `From: ${data.companyName || userData.name}\n` +
          `To: ${chatUser.userData.name}\n` +
          `-------------------\n` +
          `Invoice #: ${data.invoiceNumber || "INV-001"}\n` +
          `Date: ${data.date || new Date().toLocaleDateString()}\n` +
          `-------------------\n` +
          `Items:\n${data.items || "Services rendered"}\n` +
          `-------------------\n` +
          `Total: ${data.amount || "0.00"}\n` +
          `Status: ${data.status || "Pending"}\n` +
          `\nThank you for your business!`;
      } else if (templateType === "notice") {
        messageText = `📢 NOTICE\n\n` +
          `From: ${data.companyName || userData.name}\n` +
          `To: ${chatUser.userData.name}\n` +
          `-------------------\n` +
          `Subject: ${data.subject || "Important Notice"}\n` +
          `-------------------\n` +
          `${data.message || ""}\n` +
          `-------------------\n` +
          `Date: ${data.date || new Date().toLocaleDateString()}\n` +
          `For queries, contact us.`;
      } else if (templateType === "data") {
        messageText = `📊 DATA UPDATE\n\n` +
          `From: ${data.companyName || userData.name}\n` +
          `To: ${chatUser.userData.name}\n` +
          `-------------------\n` +
          `${data.title || "Information"}\n` +
          `-------------------\n` +
          `${data.content || ""}\n` +
          `-------------------\n` +
          `Reference: ${data.reference || "N/A"}\n` +
          `Date: ${data.date || new Date().toLocaleDateString()}`;
      }

      const uploadedAttachments = [];
      for (const file of attachments) {
        try {
          const url = await uploadToCloudinary(file);
          uploadedAttachments.push({
            type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file",
            url,
            name: file.name,
            mimeType: file.type,
          });
        } catch (uploadError) {
          console.error("Failed to upload attachment:", uploadError);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      const messageData = {
        sId: userData.id,
        text: messageText,
        createdAt: new Date(),
        status: "sent",
        messageType,
        templateType,
        businessData: {
          ...data,
          date: data.date || new Date().toLocaleDateString(),
          recipientName: chatUser.userData.name,
        },
        ...(userData.accountType === "business" ? { senderCompany: data.companyName || userData.name } : {}),
        ...(uploadedAttachments.length > 0 && { attachments: uploadedAttachments }),
      };

      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion(messageData),
      });

      updateChatLastMessage(messageText.split("\n")[0]).catch((err) => {
        console.error("Failed to update chat last message:", err);
      });

      setShowBusinessPanel(false);
      setInvoiceAttachments([]);
    } catch (error) {
      toast.error("Failed to send business message: " + error.message);
    } finally {
      sendingRef.current = false;
    }
  };

  const deleteMessage = async (index, msg) => {
    if (!messagesId || !msg) return;

    try {
      const msgRef = doc(db, "messages", messagesId);
      const msgSnap = await getDoc(msgRef);

      if (!msgSnap.exists()) return;

      const msgData = msgSnap.data();
      const updatedMessages = msgData.messages.filter((_, i) => i !== index);

      await updateDoc(msgRef, { messages: updatedMessages });
      setMessages(updatedMessages);
      toast.success("Message deleted");

      const lastMsg = updatedMessages[updatedMessages.length - 1];
      const newLastMessage = lastMsg
        ? (lastMsg.text || (lastMsg.image ? "Image" : lastMsg.video ? "Video" : ""))
        : "";

      await updateChatLastMessage(newLastMessage);
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error("Failed to delete message");
    }
  };

  const getTickIcon = (msg) => {
    const isOwnMessage = msg.sId === userData.id;
    if (!isOwnMessage) return "";

    const status = msg.status || "sent";
    const chatSeen =
      chatData?.find((c) => c.messagesId === messagesId)?.messageSeen || false;

    if (status === "read" || (status === "delivered" && chatSeen)) {
      return "✓✓";
    }

    if (status === "delivered" || (status === "sent" && chatSeen)) {
      return "✓✓";
    }

    return "✓";
  };

  const getTickClassName = (msg) => {
    const isOwnMessage = msg.sId === userData.id;
    if (!isOwnMessage) return "";

    const status = msg.status || "sent";
    const chatSeen =
      chatData?.find((c) => c.messagesId === messagesId)?.messageSeen || false;

    if (status === "read" || (status === "delivered" && chatSeen)) {
      return "tick tick-blue";
    }

    return "tick";
  };

  const parseMessageDate = (timestamp) => {
    if (!timestamp) return new Date();
    if (timestamp.toDate && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (timestamp.seconds !== undefined) {
      return new Date(timestamp.seconds * 1000);
    }
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const shouldShowDateDivider = (prevMsg, currentMsg) => {
    if (!prevMsg) return true;
    const prevDate = parseMessageDate(prevMsg.createdAt);
    const currDate = parseMessageDate(currentMsg.createdAt);
    return !isSameDay(prevDate, currDate);
  };

  const formatDateDivider = (date) => {
    if (!date || isNaN(date.getTime())) return "Today";
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = today.getTime() - target.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays > 1 && diffDays < 7) {
      // e.g. "Monday, Oct 5"
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    } else {
      // e.g. "Monday, October 5, 2026"
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatFullTimestamp = (timestamp) => {
    const d = parseMessageDate(timestamp);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const convertTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = parseMessageDate(timestamp);
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, "0");
    if (hour > 12) {
      return hour - 12 + ":" + minute + " PM";
    } else {
      return (hour === 0 ? 12 : hour) + ":" + minute + " AM";
    }
  };

  useEffect(() => {
    if (!messagesId) return;

    setMessages([]);
    isFirstLoad.current = true;

    setTimeout(() => {
      const chatMsg = document.querySelector(".chat-msg");
      if (chatMsg) {
        chatMsg.scrollTop = chatMsg.scrollHeight;
      }
    }, 0);

    const unSub = onSnapshot(doc(db, "messages", messagesId), async (res) => {
      const msgs = res.data()?.messages || [];
      const decrypted = await Promise.all(
        msgs.map(async (msg) => {
          if (msg.e2ee) {
            try {
              const keyPair = await E2EE.getOrCreateKeyPair();
              const text = await E2EE.decrypt(msg.e2ee, keyPair.privateKey);
              return { ...msg, text };
            } catch (err) {
              console.error("Decryption failed for message:", err);
              return { ...msg, text: "[Encrypted message - unable to decrypt]" };
            }
          }
          return msg;
        })
      );
      setMessages(decrypted);

      const lastMsg = decrypted[decrypted.length - 1];
      if (lastMsg && lastMsg.sId !== userData.id && lastMsg.status === "sent") {
        const msgRef = doc(db, "messages", messagesId);
        const msgData = res.data();
        const updatedMessages = [...(msgData.messages || [])];
        const lastMsgIndex = updatedMessages.length - 1;
        if (lastMsgIndex >= 0) {
          updatedMessages[lastMsgIndex] = { ...lastMsg, status: "delivered" };
          updateDoc(msgRef, { messages: updatedMessages }).catch((err) => {
            console.error("Failed to update delivered status:", err);
          });
        }
      }
    });
    return () => {
      unSub();
    };
  }, [messagesId]);

  useEffect(() => {
    if (chatUser && messagesId) {
      const chatUserDocRef = doc(db, "chats", chatUser.rId);
      getDoc(chatUserDocRef).then((snap) => {
        if (!snap.exists()) return;
        const chatData = snap.data();
        const chatIndex = chatData.chatsData.findIndex(
          (c) => c.messagesId === messagesId
        );
        if (chatIndex === -1) return;
        if (!chatData.chatsData[chatIndex].messageSeen) {
          updateDoc(chatUserDocRef, {
            chatsData: arrayRemove(chatData.chatsData[chatIndex]),
          }).catch((err) => {
            console.error("Failed to remove unread chat:", err);
          });

          const updatedChat = { ...chatData.chatsData[chatIndex], messageSeen: true };
          updateDoc(chatUserDocRef, {
            chatsData: arrayUnion(updatedChat),
          }).catch((err) => {
            console.error("Failed to mark chat as seen:", err);
          });
        }
      });
    }
  }, [messages, messagesId, chatUser]);

  useEffect(() => {
    if (messages.length === 0) return;
    if (isFirstLoad.current) {
      scrollToBottom("instant");
      isFirstLoad.current = false;
    } else {
      scrollToBottom("smooth");
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current && !input) {
      textareaRef.current.style.height = "auto";
    }
  }, [input]);

  return (
    <>
      {chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <div className="img-overlay-wrapper" style={{ width: "40px", aspectRatio: "1/1" }}>
          <img src={chatUser.userData.avatar} alt="" />
          <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
        </div>
        <div className="user-info" onClick={() => setRightSidebarVisible(true)}>
          <div className="user-name">
            {chatUser.userData.name}
            {chatUser.userData?.showLastSeen !== false && Date.now() - chatUser.userData.lastSeen <= 70000 ? (
              <span className="dot"></span>
            ) : null}
          </div>
          <div
            className={`user-status ${chatUser.userData?.showLastSeen !== false && Date.now() - chatUser.userData.lastSeen <= 70000 ? "online" : ""}`}
          >
            {chatUser.userData?.showLastSeen !== false && Date.now() - chatUser.userData.lastSeen <= 70000 ? "Online" : "Offline"}
          </div>
        </div>
        <div className="header-actions">
          <div className="icon-btn" onClick={() => setShowProfilePopup(true)} title="Contact Info">
            <img src={assets.help_icon} className="help" alt="" />
          </div>
          <div className="icon-btn arrow-btn" onClick={() => setChatVisible(false)} title="Back to chats">
            <img src={assets.arrow_icon} className="arrow" alt="" />
          </div>
        </div>
      </div>
      <div className="chat-msg">
        {messages.length === 0 ? (
          <div className="chat-empty-conversation">
            <div className="chat-empty-card">
              <div className="empty-avatar-wrap">
                <div className="img-overlay-wrapper empty-avatar">
                  <img src={chatUser.userData?.avatar} alt={chatUser.userData?.name} />
                  <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
                </div>
              </div>
              <h3 className="empty-title">{chatUser.userData?.name || "User"}</h3>
              {chatUser.userData?.username && (
                <p className="empty-handle">@{chatUser.userData.username}</p>
              )}
              
              <div className="empty-quote-badge">
                <span className="quote-icon">🕊️</span>
                <span className="quote-text">Try to keep silence in any situation</span>
              </div>

              <p className="empty-subtitle">
                No messages yet. Send a greeting or choose a quick starter below!
              </p>

              <div className="empty-quick-starters">
                <button
                  type="button"
                  className="quick-starter-btn"
                  onClick={() => sendMessage("👋 Hello!")}
                >
                  👋 Hello!
                </button>
                <button
                  type="button"
                  className="quick-starter-btn"
                  onClick={() => sendMessage("💬 How are you doing today?")}
                >
                  💬 How are you doing?
                </button>
                <button
                  type="button"
                  className="quick-starter-btn"
                  onClick={() => sendMessage("✨ Glad to connect with you!")}
                >
                  ✨ Glad to connect!
                </button>
              </div>

              <div className="empty-e2ee-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>End-to-End Encrypted • Private & Secure</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.sId === userData.id;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showDateDivider = shouldShowDateDivider(prevMsg, msg);

            return (
              <React.Fragment key={(msg.createdAt?.seconds || msg.createdAt?.getTime?.() || Date.now()) + "-" + msg.sId + "-" + index}>
                {showDateDivider && (
                  <div className="chat-date-separator">
                    <span className="date-separator-pill">
                      {formatDateDivider(parseMessageDate(msg.createdAt))}
                    </span>
                  </div>
                )}
                <div className={isOwnMessage ? "s-msg" : "r-msg"}>
                  {(() => {
                    const isBusiness = parseBusinessMessage(msg);
                    if (isBusiness) {
                      return (
                        <BusinessMessageCard
                          msg={msg}
                          isOwn={isOwnMessage}
                          convertTimestamp={convertTimestamp}
                          formatFullTimestamp={formatFullTimestamp}
                          getTickClassName={getTickClassName}
                          getTickIcon={getTickIcon}
                          onOpenLightbox={handleOpenLightbox}
                        />
                      );
                    }
                    if (msg["image"]) {
                      return (
                        <PhotoMessageCard
                          src={msg.image}
                          isOwn={isOwnMessage}
                          msg={msg}
                          convertTimestamp={convertTimestamp}
                          formatFullTimestamp={formatFullTimestamp}
                          getTickClassName={getTickClassName}
                          getTickIcon={getTickIcon}
                          onOpenLightbox={handleOpenLightbox}
                        />
                      );
                    }
                    if (msg["video"]) {
                      return (
                        <VideoMessagePlayer
                          src={msg.video}
                          isOwn={isOwnMessage}
                          msg={msg}
                          convertTimestamp={convertTimestamp}
                          formatFullTimestamp={formatFullTimestamp}
                          getTickClassName={getTickClassName}
                          getTickIcon={getTickIcon}
                          onOpenLightbox={handleOpenLightbox}
                        />
                      );
                    }
                    if (msg["audio"]) {
                      return (
                        <VoiceMessagePlayer
                          src={msg.audio}
                          isOwn={isOwnMessage}
                          msg={msg}
                          convertTimestamp={convertTimestamp}
                          formatFullTimestamp={formatFullTimestamp}
                          getTickClassName={getTickClassName}
                          getTickIcon={getTickIcon}
                        />
                      );
                    }
                    return (
                      <p className="msg">
                        {msg.text}
                        {msg.attachments?.length > 0 && (
                          <div className="msg-attachments">
                            {msg.attachments.map((att, idx) => (
                              <div key={idx} className="msg-attachment">
                                {att.type === "image" ? (
                                  <img src={att.url} alt={att.name} />
                                ) : att.type === "video" ? (
                                  <video src={att.url} controls />
                                ) : (
                                  <a href={att.url} target="_blank" rel="noreferrer" className="file-link">
                                    📄 {att.name}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <span className="msg-bottom">
                          <span className={getTickClassName(msg)}>
                            {getTickIcon(msg)}
                          </span>
                          <span className="msg-time" title={formatFullTimestamp(msg.createdAt)}>
                            {convertTimestamp(msg.createdAt)}
                          </span>
                        </span>
                      </p>
                    );
                  })()}
                  <div className="msg-meta">
                    <div className="img-overlay-wrapper" style={{ width: "22px", aspectRatio: "1/1" }}>
                      <img
                        src={isOwnMessage ? userData.avatar : chatUser.userData.avatar}
                        alt=""
                      />
                      <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
                    </div>
                  </div>
                  <div
                    className="delete-msg-btn"
                    onClick={() => deleteMessage(index, msg)}
                    title="Delete message"
                  >
                    ×
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        {videoUpload && (
          <div className="s-msg video-upload-pending-msg">
            <div className="video-upload-card">
              <div className="video-upload-preview-wrap">
                {videoUpload.previewUrl ? (
                  <video
                    src={videoUpload.previewUrl}
                    className="video-upload-thumb"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="video-upload-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect width="14" height="14" x="1" y="5" rx="2" ry="2" />
                    </svg>
                  </div>
                )}

                {/* Top Live Badge */}
                <div className="video-upload-top-badge">
                  <span className="upload-live-dot" />
                  <span>UPLOADING VIDEO</span>
                </div>

                {/* Circular Progress Overlay */}
                <div className="video-upload-circular-overlay">
                  <div className="video-progress-ring-wrap">
                    <svg className="video-progress-ring" width="56" height="56" viewBox="0 0 56 56">
                      <circle
                        className="progress-ring-bg"
                        cx="28"
                        cy="28"
                        r="23"
                        strokeWidth="4"
                      />
                      <circle
                        className="progress-ring-bar"
                        cx="28"
                        cy="28"
                        r="23"
                        strokeWidth="4"
                        style={{
                          strokeDasharray: `${2 * Math.PI * 23}`,
                          strokeDashoffset: `${2 * Math.PI * 23 * (1 - (videoUpload.progress || 0) / 100)}`,
                        }}
                      />
                    </svg>
                    <div className="video-progress-ring-text">
                      <span className="ring-percent">{videoUpload.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="video-upload-meta-wrap">
                <div className="video-upload-file-info">
                  <div className="video-upload-filename" title={videoUpload.name}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect width="14" height="14" x="1" y="5" rx="2" ry="2" />
                    </svg>
                    <span>{videoUpload.name}</span>
                  </div>
                  <span className="video-upload-filesize">{videoUpload.formattedSize}</span>
                </div>

                <div className="video-upload-linear-bar">
                  <div
                    className="video-upload-linear-fill"
                    style={{ width: `${Math.max(4, videoUpload.progress)}%` }}
                  />
                </div>

                <div className="video-upload-footer">
                  <span className="video-upload-status-text">
                    <span className="status-pulse-dot" />
                    {videoUpload.statusText}
                  </span>
                  <button
                    type="button"
                    className="video-upload-abort-btn"
                    onClick={cancelVideoUpload}
                    title="Cancel upload"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <div className="msg-meta">
              <div className="img-overlay-wrapper" style={{ width: "22px", aspectRatio: "1/1" }}>
                <img src={userData.avatar} alt="" />
              </div>
              <p>Sending...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {videoUpload && (
        <div className="chat-upload-floating-banner">
          <div className="upload-banner-left">
            <div className="upload-banner-icon-box">
              <div className="upload-banner-spinner" />
            </div>
            <div className="upload-banner-text">
              <span className="upload-banner-title">
                Sending video: <strong>{videoUpload.name}</strong>
              </span>
              <span className="upload-banner-sub">
                {videoUpload.progress}% • {videoUpload.formattedSize}
              </span>
            </div>
          </div>
          <div className="upload-banner-right">
            <div className="upload-banner-mini-bar">
              <div
                className="upload-banner-mini-fill"
                style={{ width: `${videoUpload.progress}%` }}
              />
            </div>
            <button
              type="button"
              className="upload-banner-cancel-btn"
              onClick={cancelVideoUpload}
              title="Cancel video upload"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className={`chat-input ${isRecording ? "recording-active" : ""}`}>
        {isRecording ? (
          <div className="chat-inline-recording-bar">
            <div className="inline-rec-status">
              <span className="inline-rec-dot"></span>
              <span className="inline-rec-text">REC</span>
            </div>
            <div className="inline-recording-waves">
              <span className="rec-bar rbar-1"></span>
              <span className="rec-bar rbar-2"></span>
              <span className="rec-bar rbar-3"></span>
              <span className="rec-bar rbar-4"></span>
              <span className="rec-bar rbar-5"></span>
              <span className="rec-bar rbar-6"></span>
              <span className="rec-bar rbar-7"></span>
              <span className="rec-bar rbar-8"></span>
              <span className="rec-bar rbar-9"></span>
              <span className="rec-bar rbar-10"></span>
            </div>
            <span className="inline-rec-timer">{formatRecordingTime(recordingDuration)}</span>
            <button
              type="button"
              className="inline-rec-discard-btn"
              onClick={cancelRecording}
              title="Discard recording"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            value={input}
            placeholder="Send a message"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
        )}

        {!isRecording && (
          <>
            <input
              onChange={sendImage}
              type="file"
              id="image"
              accept="image/png, image/jpeg, image/webp, video/mp4, video/webm, video/quicktime, video/*"
              hidden
              disabled={!!videoUpload}
            />

            <label
              htmlFor="image"
              title={videoUpload ? "Upload in progress..." : "Send photo or video"}
              style={videoUpload ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" } : {}}
            >
              <img src={assets.gallery_icon} alt="Send photo or video" />
            </label>
          </>
        )}

        <div
          className={`emoji-btn audio-btn ${isRecording ? "recording" : ""}`}
          onClick={toggleRecording}
          title={isRecording ? "Stop & Send audio" : "Record audio"}
        >
          {isRecording ? "⏹" : "🎤"}
        </div>

        {!isRecording && (
          <>
            <div className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              😊
            </div>

            {userData?.accountType === "business" && (
              <div className="emoji-btn business-btn" onClick={() => setShowBusinessPanel(!showBusinessPanel)} title="Business Tools">
                🏢
              </div>
            )}

            <button type="button" className="send-btn" onClick={() => {
              const value = textareaRef.current?.value || input || "";
              if (value.trim()) sendMessage(value);
            }} aria-label="Send">
              <img src={assets.send_button} alt="Send" />
            </button>
          </>
        )}
      </div>

      {showEmojiPicker &&
        createPortal(
          <div className="emoji-picker-overlay" onClick={() => setShowEmojiPicker(false)}>
            <div className="emoji-picker-card" onClick={(e) => e.stopPropagation()}>
              {/* Header with Search & Close */}
              <div className="emoji-picker-header">
                <div className="emoji-search-bar">
                  <svg className="emoji-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search emojis (e.g. smile, love, fire)..."
                    value={emojiSearchQuery}
                    onChange={(e) => setEmojiSearchQuery(e.target.value)}
                    className="emoji-search-input"
                    autoFocus
                  />
                  {emojiSearchQuery && (
                    <button
                      type="button"
                      className="emoji-search-clear"
                      onClick={() => setEmojiSearchQuery("")}
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="emoji-close-btn"
                  onClick={() => setShowEmojiPicker(false)}
                  title="Close emoji picker"
                >
                  ✕
                </button>
              </div>

              {/* Quick Reactions Bar */}
              <div className="emoji-quick-reactions">
                <span className="quick-reaction-label">Quick:</span>
                <div className="quick-reaction-list">
                  {QUICK_REACTIONS.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="quick-reaction-item"
                      onClick={() => handleEmojiSelect(emoji)}
                      title={`Insert ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Navigation Tabs */}
              {!emojiSearchQuery && (
                <div className="emoji-category-nav">
                  <button
                    type="button"
                    className={`emoji-cat-tab ${activeEmojiCategory === "recent" ? "active" : ""}`}
                    onClick={() => setActiveEmojiCategory("recent")}
                    title="Recently Used"
                  >
                    <span className="cat-icon">🕒</span>
                    <span className="cat-label">Recent</span>
                  </button>
                  {EMOJI_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`emoji-cat-tab ${activeEmojiCategory === cat.id ? "active" : ""}`}
                      onClick={() => setActiveEmojiCategory(cat.id)}
                      title={cat.name}
                    >
                      <span className="cat-icon">{cat.icon}</span>
                      <span className="cat-label">{cat.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Emoji Grid / Scroll Body */}
              <div className="emoji-scroll-body">
                {emojiSearchQuery.trim() ? (
                  /* Search Results */
                  <div className="emoji-section">
                    <div className="emoji-section-title">
                      <span>Search Results for "{emojiSearchQuery}"</span>
                    </div>
                    {(() => {
                      const q = emojiSearchQuery.toLowerCase().trim();
                      const filtered = ALL_EMOJIS.filter(
                        (item) =>
                          item.char.includes(q) ||
                          item.keywords.toLowerCase().includes(q) ||
                          item.categoryName.toLowerCase().includes(q)
                      );

                      if (filtered.length === 0) {
                        return (
                          <div className="emoji-empty-search">
                            <span className="empty-emoji-icon">🔍</span>
                            <p>No matching emojis found</p>
                            <small>Try searching with another keyword</small>
                          </div>
                        );
                      }

                      return (
                        <div className="emoji-grid-cells">
                          {filtered.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="emoji-cell"
                              onClick={() => handleEmojiSelect(item.char)}
                              title={item.keywords.split(" ").slice(0, 4).join(" ")}
                            >
                              {item.char}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                ) : activeEmojiCategory === "recent" ? (
                  /* Recent Emojis Tab */
                  <div className="emoji-section">
                    <div className="emoji-section-title">
                      <span>🕒 Recently Used ({recentEmojis.length})</span>
                      {recentEmojis.length > 0 && (
                        <button
                          type="button"
                          className="emoji-clear-recents-btn"
                          onClick={() => {
                            setRecentEmojis([]);
                            try {
                              localStorage.removeItem("MOCOSN_CHAT_recent_emojis");
                            } catch (err) {
                              console.warn(err);
                            }
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {recentEmojis.length === 0 ? (
                      <div className="emoji-empty-recents">
                        <span>✨</span>
                        <p>No recent emojis yet</p>
                        <small>Emojis you tap will appear here</small>
                      </div>
                    ) : (
                      <div className="emoji-grid-cells">
                        {recentEmojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="emoji-cell"
                            onClick={() => handleEmojiSelect(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Selected Category */
                  (() => {
                    const currentCat = EMOJI_CATEGORIES.find((c) => c.id === activeEmojiCategory) || EMOJI_CATEGORIES[0];
                    return (
                      <div className="emoji-section">
                        <div className="emoji-section-title">
                          <span>{currentCat.icon} {currentCat.name}</span>
                          <span className="emoji-count-badge">{currentCat.emojis.length}</span>
                        </div>
                        <div className="emoji-grid-cells">
                          {currentCat.emojis.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="emoji-cell"
                              onClick={() => handleEmojiSelect(item.char)}
                              title={item.keywords.split(" ").slice(0, 4).join(" ")}
                            >
                              {item.char}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Footer info & Send shortcut */}
              <div className="emoji-picker-footer">
                <span className="emoji-footer-tip">
                  💡 Click emoji to insert at cursor
                </span>
                {input.trim() && (
                  <button
                    type="button"
                    className="emoji-footer-send-btn"
                    onClick={() => {
                      setShowEmojiPicker(false);
                      sendMessage(input);
                    }}
                  >
                    Send Message
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      {showBusinessPanel && userData?.accountType === "business" &&
        createPortal(
          <div className="business-panel-overlay" onClick={() => setShowBusinessPanel(false)}>
            <div className="business-panel-card" onClick={(e) => e.stopPropagation()}>
              <div className="business-panel-header">
                <div className="business-panel-header-left">
                  <span className="business-panel-icon">🏢</span>
                  <div>
                    <h3 className="business-panel-title">Business Communication Tools</h3>
                    <p className="business-panel-sub">Send official invoices, notices & data updates</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="business-panel-close-btn"
                  onClick={() => setShowBusinessPanel(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="business-panel-body">
                <div className="business-template-tabs">
                  <button
                    type="button"
                    className={`template-tab ${businessTemplate === "invoice" ? "active" : ""}`}
                    onClick={() => setBusinessTemplate("invoice")}
                  >
                    <span>📄</span>
                    <span>Invoice</span>
                  </button>
                  <button
                    type="button"
                    className={`template-tab ${businessTemplate === "notice" ? "active" : ""}`}
                    onClick={() => setBusinessTemplate("notice")}
                  >
                    <span>📢</span>
                    <span>Notice</span>
                  </button>
                  <button
                    type="button"
                    className={`template-tab ${businessTemplate === "data" ? "active" : ""}`}
                    onClick={() => setBusinessTemplate("data")}
                  >
                    <span>📊</span>
                    <span>Data Report</span>
                  </button>
                </div>

                {businessTemplate === "invoice" && (
                  <div className="template-form">
                    <div className="form-row-2col">
                      <div className="form-field-group">
                        <label className="field-lbl">Company / Brand Name</label>
                        <input
                          id="invoice-company"
                          placeholder="Your Company Name"
                          defaultValue={userData.companyName || userData.name}
                          className="modern-biz-input"
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="field-lbl">Invoice #</label>
                        <input
                          id="invoice-number"
                          placeholder="INV-001"
                          defaultValue={`INV-${Math.floor(100 + Math.random() * 900)}`}
                          className="modern-biz-input"
                        />
                      </div>
                    </div>

                    <div className="form-row-2col">
                      <div className="form-field-group">
                        <label className="field-lbl">Amount & Currency</label>
                        <div className="currency-amount-wrap">
                          <select id="invoice-currency" defaultValue="$" className="currency-select">
                            <option value="$">$ (USD)</option>
                            <option value="₹">₹ (INR)</option>
                            <option value="€">€ (EUR)</option>
                            <option value="£">£ (GBP)</option>
                            <option value="AED ">AED</option>
                            <option value="SAR ">SAR</option>
                            <option value="C$">C$ (CAD)</option>
                            <option value="A$">A$ (AUD)</option>
                          </select>
                          <input
                            id="invoice-amount"
                            placeholder="0.00"
                            defaultValue="0.00"
                            className="modern-biz-input amount-input"
                          />
                        </div>
                      </div>
                      <div className="form-field-group">
                        <label className="field-lbl">Payment Status</label>
                        <select id="invoice-status" defaultValue="Pending" className="modern-biz-input">
                          <option value="Paid">🟢 Paid</option>
                          <option value="Pending">🟡 Pending</option>
                          <option value="Overdue">🔴 Overdue</option>
                          <option value="Draft">⚪ Draft</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-field-group">
                      <label className="field-lbl">Items / Services Rendered</label>
                      <textarea
                        id="invoice-items"
                        placeholder="e.g. Web Development & UI Design&#10;Logo Design & Branding"
                        defaultValue="Services rendered"
                        rows={3}
                        className="modern-biz-textarea"
                      />
                    </div>

                    <div className="biz-attachment-section">
                      <input
                        id="invoice-attachments"
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setInvoiceAttachments((prev) => [...prev, ...files]);
                        }}
                        hidden
                      />
                      <label htmlFor="invoice-attachments" className="modern-attach-btn">
                        <span>📎</span>
                        <span>Attach Documents / Media ({invoiceAttachments.length})</span>
                      </label>
                      {invoiceAttachments.length > 0 && (
                        <div className="attachment-list">
                          {invoiceAttachments.map((file, idx) => (
                            <div key={idx} className="attachment-chip-removable">
                              <span className="chip-name">{file.name}</span>
                              <button
                                type="button"
                                className="chip-remove-btn"
                                onClick={() => setInvoiceAttachments((prev) => prev.filter((_, i) => i !== idx))}
                                title="Remove file"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="send-template-btn invoice-btn"
                      onClick={async () => {
                        const curr = document.getElementById("invoice-currency")?.value || "$";
                        const amtVal = document.getElementById("invoice-amount")?.value || "0.00";
                        const formattedAmt = amtVal.startsWith("$") || amtVal.startsWith("₹") || amtVal.startsWith("€") || amtVal.startsWith("£") ? amtVal : `${curr}${amtVal}`;
                        const data = {
                          companyName: document.getElementById("invoice-company")?.value || userData.name,
                          invoiceNumber: document.getElementById("invoice-number")?.value || "INV-001",
                          items: document.getElementById("invoice-items")?.value || "Services rendered",
                          amount: formattedAmt,
                          status: document.getElementById("invoice-status")?.value || "Pending",
                        };
                        await sendBusinessMessage("invoice", data, invoiceAttachments);
                        setInvoiceAttachments([]);
                      }}
                    >
                      <span>📄</span>
                      <span>Send Official Invoice</span>
                    </button>
                  </div>
                )}

                {businessTemplate === "notice" && (
                  <div className="template-form">
                    <div className="form-field-group">
                      <label className="field-lbl">Company / Organization</label>
                      <input
                        id="notice-company"
                        placeholder="Company Name"
                        defaultValue={userData.companyName || userData.name}
                        className="modern-biz-input"
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="field-lbl">Subject Headline</label>
                      <input
                        id="notice-subject"
                        placeholder="e.g. Scheduled System Maintenance / Policy Update"
                        defaultValue="Important Notice"
                        className="modern-biz-input"
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="field-lbl">Notice Message</label>
                      <textarea
                        id="notice-message"
                        placeholder="Write your notice message in detail..."
                        rows={4}
                        defaultValue=""
                        className="modern-biz-textarea"
                      />
                    </div>

                    <div className="biz-attachment-section">
                      <input
                        id="notice-attachments"
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setInvoiceAttachments((prev) => [...prev, ...files]);
                        }}
                        hidden
                      />
                      <label htmlFor="notice-attachments" className="modern-attach-btn">
                        <span>📎</span>
                        <span>Attach Documents / Media ({invoiceAttachments.length})</span>
                      </label>
                      {invoiceAttachments.length > 0 && (
                        <div className="attachment-list">
                          {invoiceAttachments.map((file, idx) => (
                            <div key={idx} className="attachment-chip-removable">
                              <span className="chip-name">{file.name}</span>
                              <button
                                type="button"
                                className="chip-remove-btn"
                                onClick={() => setInvoiceAttachments((prev) => prev.filter((_, i) => i !== idx))}
                                title="Remove file"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="send-template-btn notice-btn"
                      onClick={async () => {
                        const data = {
                          companyName: document.getElementById("notice-company")?.value || userData.name,
                          subject: document.getElementById("notice-subject")?.value || "Important Notice",
                          message: document.getElementById("notice-message")?.value || "",
                        };
                        await sendBusinessMessage("notice", data, invoiceAttachments);
                        setInvoiceAttachments([]);
                      }}
                    >
                      <span>📢</span>
                      <span>Send Official Notice</span>
                    </button>
                  </div>
                )}

                {businessTemplate === "data" && (
                  <div className="template-form">
                    <div className="form-row-2col">
                      <div className="form-field-group">
                        <label className="field-lbl">Company / Brand</label>
                        <input
                          id="data-company"
                          placeholder="Company Name"
                          defaultValue={userData.companyName || userData.name}
                          className="modern-biz-input"
                        />
                      </div>
                      <div className="form-field-group">
                        <label className="field-lbl">Reference Code</label>
                        <input
                          id="data-reference"
                          placeholder="REF-001"
                          defaultValue={`REF-${Math.floor(1000 + Math.random() * 9000)}`}
                          className="modern-biz-input"
                        />
                      </div>
                    </div>
                    <div className="form-field-group">
                      <label className="field-lbl">Report / Update Title</label>
                      <input
                        id="data-title"
                        placeholder="e.g. Q3 Sales Summary / Metrics"
                        defaultValue="Information Update"
                        className="modern-biz-input"
                      />
                    </div>
                    <div className="form-field-group">
                      <label className="field-lbl">Report Content & Metrics</label>
                      <textarea
                        id="data-content"
                        placeholder="Enter update content and data..."
                        rows={4}
                        defaultValue=""
                        className="modern-biz-textarea"
                      />
                    </div>

                    <div className="biz-attachment-section">
                      <input
                        id="data-attachments"
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setInvoiceAttachments((prev) => [...prev, ...files]);
                        }}
                        hidden
                      />
                      <label htmlFor="data-attachments" className="modern-attach-btn">
                        <span>📎</span>
                        <span>Attach Documents / Media ({invoiceAttachments.length})</span>
                      </label>
                      {invoiceAttachments.length > 0 && (
                        <div className="attachment-list">
                          {invoiceAttachments.map((file, idx) => (
                            <div key={idx} className="attachment-chip-removable">
                              <span className="chip-name">{file.name}</span>
                              <button
                                type="button"
                                className="chip-remove-btn"
                                onClick={() => setInvoiceAttachments((prev) => prev.filter((_, i) => i !== idx))}
                                title="Remove file"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="send-template-btn data-btn"
                      onClick={async () => {
                        const data = {
                          companyName: document.getElementById("data-company")?.value || userData.name,
                          title: document.getElementById("data-title")?.value || "Information Update",
                          content: document.getElementById("data-content")?.value || "",
                          reference: document.getElementById("data-reference")?.value || "N/A",
                        };
                        await sendBusinessMessage("data", data, invoiceAttachments);
                        setInvoiceAttachments([]);
                      }}
                    >
                      <span>📊</span>
                      <span>Send Data Report</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      {showProfilePopup &&
        createPortal(
          <div className="profile-popup-overlay" onClick={() => setShowProfilePopup(false)}>
            <div className="profile-popup-card" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="profile-popup-close-btn"
                onClick={() => setShowProfilePopup(false)}
                aria-label="Close contact info"
              >
                ✕
              </button>

              <div className="profile-popup-header-banner"></div>

              <div className="profile-popup-header-content">
                <div className="profile-popup-avatar-wrap">
                  <div className="img-overlay-wrapper profile-popup-avatar">
                    <img src={chatUser.userData?.avatar} alt={chatUser.userData?.name} />
                    <div className="overlay" onContextMenu={(e) => e.preventDefault()} />
                  </div>
                  {chatUser.userData?.showLastSeen !== false && (
                    <span
                      className={`profile-popup-online-indicator ${
                        Date.now() - (chatUser.userData?.lastSeen || 0) <= 70000 ? "online" : "offline"
                      }`}
                    ></span>
                  )}
                </div>

                <div className="profile-popup-title-area">
                  <h3 className="profile-popup-name">{chatUser.userData?.name || "User"}</h3>
                  
                  {chatUser.userData?.username && (
                    <div
                      className="profile-popup-username-badge"
                      onClick={() => {
                        navigator.clipboard.writeText(`@${chatUser.userData.username}`);
                        toast.success("Username copied to clipboard!");
                      }}
                      title="Click to copy username"
                    >
                      <span>@{chatUser.userData.username}</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                      </svg>
                    </div>
                  )}

                  <div className="profile-popup-tag-row">
                    <span className={`profile-badge ${chatUser.userData?.accountType === "business" ? "business" : "personal"}`}>
                      {chatUser.userData?.accountType === "business" ? "🏢 Business Account" : "👤 Personal"}
                    </span>
                    {chatUser.userData?.showLastSeen !== false && (
                      <span
                        className={`profile-status-pill ${
                          Date.now() - (chatUser.userData?.lastSeen || 0) <= 70000 ? "online" : "offline"
                        }`}
                      >
                        <span className="dot"></span>
                        {Date.now() - (chatUser.userData?.lastSeen || 0) <= 70000 ? "Active Now" : "Offline"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-popup-body">
                {chatUser.userData?.bio && chatUser.userData?.showBio !== false && (
                  <div className="profile-popup-section bio-section">
                    <span className="section-label">About</span>
                    <p className="profile-bio-text">{chatUser.userData.bio}</p>
                  </div>
                )}

                <div className="profile-popup-section details-section">
                  <span className="section-label">Contact & Details</span>

                  {chatUser.userData?.email && chatUser.userData?.showEmail !== false && (
                    <div className="profile-detail-row">
                      <div className="detail-icon-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="20" height="16" x="2" y="4" rx="2"/>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                      </div>
                      <div className="detail-text-col">
                        <span className="detail-name">Email</span>
                        <span className="detail-val">{chatUser.userData.email}</span>
                      </div>
                    </div>
                  )}

                  {chatUser.userData?.phone && chatUser.userData?.showPhone !== false && (
                    <div className="profile-detail-row">
                      <div className="detail-icon-box">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </div>
                      <div className="detail-text-col">
                        <span className="detail-name">Phone</span>
                        <span className="detail-val">{chatUser.userData.phone}</span>
                      </div>
                    </div>
                  )}

                  {chatUser.userData?.accountType === "business" && chatUser.userData?.showBusinessInfo !== false && (
                    <>
                      {chatUser.userData?.companyName && (
                        <div className="profile-detail-row">
                          <div className="detail-icon-box">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="18" height="18" x="3" y="3" rx="2"/>
                              <path d="M3 9h18"/>
                              <path d="M9 21V9"/>
                            </svg>
                          </div>
                          <div className="detail-text-col">
                            <span className="detail-name">Company</span>
                            <span className="detail-val">{chatUser.userData.companyName}</span>
                          </div>
                        </div>
                      )}
                      {chatUser.userData?.industry && (
                        <div className="profile-detail-row">
                          <div className="detail-icon-box">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                            </svg>
                          </div>
                          <div className="detail-text-col">
                            <span className="detail-name">Industry</span>
                            <span className="detail-val">{chatUser.userData.industry}</span>
                          </div>
                        </div>
                      )}
                      {chatUser.userData?.website && (
                        <div className="profile-detail-row">
                          <div className="detail-icon-box">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="2" y1="12" x2="22" y2="12"/>
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                          </div>
                          <div className="detail-text-col">
                            <span className="detail-name">Website</span>
                            <a
                              href={chatUser.userData.website.startsWith("http") ? chatUser.userData.website : `https://${chatUser.userData.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="detail-val-link"
                            >
                              {chatUser.userData.website.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        </div>
                      )}
                      {chatUser.userData?.address && (
                        <div className="profile-detail-row">
                          <div className="detail-icon-box">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                          </div>
                          <div className="detail-text-col">
                            <span className="detail-name">Address</span>
                            <span className="detail-val">{chatUser.userData.address}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="profile-detail-row encryption-badge-row">
                    <div className="detail-icon-box e2ee-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <div className="detail-text-col">
                      <span className="detail-name">Security</span>
                      <span className="detail-val e2ee-text">End-to-End Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-popup-footer">
                <button
                  type="button"
                  className="profile-popup-action-btn media-action-btn"
                  onClick={() => {
                    setRightSidebarVisible(true);
                    setShowProfilePopup(false);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <span>View Shared Media</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-welcome-card">
        <div className="chat-welcome-icon-box">
          <img src={assets.logo_icon || assets.logo} alt="MOCOSN CHAT" />
        </div>
        <h2 className="welcome-title">Chat Anytime, Anywhere</h2>
        <p className="welcome-tagline">Secure • Real-Time • Intelligent</p>
        <p className="welcome-subtitle">
          Select a conversation from the sidebar or search a contact to start chatting.
        </p>
        
        <div className="welcome-feature-pills">
          <div className="welcome-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>End-to-End Encrypted</span>
          </div>
          <div className="welcome-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span>Instant Sync</span>
          </div>
          <div className="welcome-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="3" rx="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            <span>Media & Audio</span>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* Media Lightbox Viewer Modal in ChatBox */}
      {lightboxMedia &&
        createPortal(
          <div className="media-lightbox-overlay" onClick={() => setLightboxMedia(null)}>
            <div className="media-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setLightboxMedia(null)}
                aria-label="Close viewer"
              >
                ✕
              </button>
              <div className="lightbox-media-wrapper">
                {lightboxMedia.type === "video" ? (
                  <video
                    src={lightboxMedia.url}
                    controls
                    autoPlay
                    className="lightbox-video"
                  />
                ) : (
                  <img
                    src={lightboxMedia.url}
                    alt="Full size media"
                    className="lightbox-image"
                    style={{
                      transform: `scale(${lightboxZoom}) rotate(${lightboxRotation}deg)`,
                      transition: "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
                    }}
                  />
                )}
              </div>
              <div className="lightbox-toolbar">
                {lightboxMedia.type === "image" && (
                  <div className="lightbox-zoom-controls">
                    <button
                      type="button"
                      className="lightbox-tool-btn"
                      onClick={() => setLightboxZoom((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))))}
                      title="Zoom Out"
                    >
                      🔍−
                    </button>
                    <button
                      type="button"
                      className="lightbox-tool-btn"
                      onClick={() => setLightboxZoom(1)}
                      title="Reset Zoom (100%)"
                    >
                      {Math.round(lightboxZoom * 100)}%
                    </button>
                    <button
                      type="button"
                      className="lightbox-tool-btn"
                      onClick={() => setLightboxZoom((prev) => Math.min(3, Number((prev + 0.25).toFixed(2))))}
                      title="Zoom In"
                    >
                      🔍+
                    </button>
                    <button
                      type="button"
                      className="lightbox-tool-btn"
                      onClick={() => setLightboxRotation((prev) => (prev + 90) % 360)}
                      title="Rotate 90°"
                    >
                      🔄
                    </button>
                  </div>
                )}

                <a
                  href={lightboxMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="lightbox-action-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>Download Original Photo</span>
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Audio Recording Modal Popup */}
      {isRecording &&
        createPortal(
          <div className="audio-recording-overlay" onClick={cancelRecording}>
            <div className="audio-recording-modal" onClick={(e) => e.stopPropagation()}>
              <div className="audio-recording-glow-aura"></div>

              <div className="recording-modal-header">
                <div className="rec-live-badge">
                  <span className="rec-live-dot"></span>
                  <span>LIVE RECORDING</span>
                </div>
                <button
                  type="button"
                  className="recording-close-btn"
                  onClick={cancelRecording}
                  title="Discard recording"
                >
                  ✕
                </button>
              </div>

              {/* Pulse Mic Centerpiece */}
              <div className="audio-mic-hero">
                <div className="mic-radar-ring ring-1"></div>
                <div className="mic-radar-ring ring-2"></div>
                <div className="mic-radar-ring ring-3"></div>
                <div className="audio-mic-circle">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                  </svg>
                </div>
              </div>

              {/* Dynamic Waveform Visualizer */}
              <div className="audio-eq-container">
                <div className="audio-eq-bars">
                  <span className="audio-eq-bar eq-1"></span>
                  <span className="audio-eq-bar eq-2"></span>
                  <span className="audio-eq-bar eq-3"></span>
                  <span className="audio-eq-bar eq-4"></span>
                  <span className="audio-eq-bar eq-5"></span>
                  <span className="audio-eq-bar eq-6"></span>
                  <span className="audio-eq-bar eq-7"></span>
                  <span className="audio-eq-bar eq-8"></span>
                  <span className="audio-eq-bar eq-9"></span>
                  <span className="audio-eq-bar eq-10"></span>
                  <span className="audio-eq-bar eq-11"></span>
                  <span className="audio-eq-bar eq-12"></span>
                  <span className="audio-eq-bar eq-13"></span>
                  <span className="audio-eq-bar eq-14"></span>
                  <span className="audio-eq-bar eq-15"></span>
                  <span className="audio-eq-bar eq-16"></span>
                  <span className="audio-eq-bar eq-17"></span>
                  <span className="audio-eq-bar eq-18"></span>
                  <span className="audio-eq-bar eq-19"></span>
                  <span className="audio-eq-bar eq-20"></span>
                </div>
              </div>

              {/* Timer Display */}
              <div className="audio-timer-display">
                <span className="audio-timer-number">{formatRecordingTime(recordingDuration)}</span>
                <span className="audio-timer-sub">Recording your voice note • Speak clearly</span>
              </div>

              {/* Controls Action Row */}
              <div className="recording-actions-row">
                <button
                  type="button"
                  className="rec-action-btn rec-discard-btn"
                  onClick={cancelRecording}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                  <span>Discard</span>
                </button>

                <button
                  type="button"
                  className="rec-action-btn rec-send-btn"
                  onClick={stopAndSendRecording}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  <span>Finish & Send</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ChatBox;
