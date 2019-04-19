// JumbleWords 
// author:   Rodney Reid http://r0dney.com
// version 1.2, December 19th 2010)
// version 1.3, Rewritten november 23rd 2014 -- different levels of word jumble (reverse alpha order, alpha order, etc)
//

///////////////////////////////////////////////////////////////////////
// determines if word is a plural or not.
// http://www.ehow.com/how_5754791_identify-singular-plural-nouns.html
// @return bool - true: word is pluralized, false: word is not plural.
///////////////////////////////////////////////////////////////////////
var isPlural = function(word) {
  var last = word.charAt(word.length-1).toLowerCase();
  var last2 = word.charAt(word.length-2).toLowerCase();
  var last3 = word.charAt(word.length-3).toLowerCase();
  
  // STEP 1:
  // Check if the word you're wondering about ends with an "s," because most plural nouns do. 
  // However, not all nouns ending is "s" are plural, so if you do see an "s" at the end of the word, 
  //  first check to see if the letter before the word is another "s" or a vowel. 
  //
  // If, for example, the word is "bricks," that would be plural of "brick." 
  // However, if the word is "boss," it is not plural. If there is not an "s" or a vowel 
  //  before the "s" you see, it's likely the word is indeed a plural noun.
  
  
  if (last === 's') {    
    // STEP 2:
    // Know that there is always an exception to the rule after reading Step 1, as many plural nouns will have a
    //   vowel before the "s" at the end. And that vowel is the letter "e." 
    // Use the example from Step 1, "boss." Words such as "boss," where the root word ends in "s" can be made 
    //    plural by adding an "es" instead of adding another "s." 
    //  
    // Words ending in "x," "ch," "sh" or "z" also cannot be pronounced correctly with an "s" added to the end, 
    //  so they too need an "es" to be made plural.  Examples include "foxes," "churches," "bushes" and "buzzes."
    //
    // Check the word you're wondering about to see if this is the case.
    if (last2 === 's') {  // boss, moss, floss, emboss...
      return false;
    } else if (last2 === 'e') {
      return true; // screws up on 
    } else {
      return true; // WTF?  TODO:   This is a cheap out.... there's still a lot of words that are NOT plural
    }
  } else {
    return false;
  }
};

///////////////////////////////////////////////////////
// shuffles an array. -  this was cribbed from somewhere else.
// @return array - same array, randomized
///////////////////////////////////////////////////////
var shuffle = function(v) {
  for (var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
  return v;
};


////////////////////////////////////////////////////////////
// Splits a text string into an array of words. 
// anything NOT a-z or A-Z is it's own word (like spaces).
//
// version 2 adds support for NOT splitting 
// up a http / https / mailto / ftp link until it hits a space.
//
// @param string txt - freeform text.
// @returns array - words & single symbols, in original order
////////////////////////////////////////////////////////////
var splitwords = function(txt) {
  var words = [], word = '', c, untilSpace = false; 
  var valid = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', space = " \n\t\r\f";
  var nonwords = {ftp:'',http:'',https:'',mailto:''};
  for (var x = 0; x!=txt.length; x++) {
    c = txt.charAt(x);
    if (!untilSpace) {    
      if (valid.indexOf(c) >-1) { // is a letter
        word += ''+c;
      } else {
        if (c == ':' && (word.toLowerCase() in nonwords)) {
          word+= ''+c;
          untilSpace = true;
          continue;
        }
        if (word != '') words.push(word);
        words.push(c);
        word = '';
      }
    } else {
      if (space.indexOf(c) == -1) { // no space yet, inside a link
        word += ''+c;
      } else {
        untilSpace = false;
        words.push(word);
        words.push(c);
        word = '';
      }
    }
  }
  if (word != '') words.push(word);
  return words;
};

///////////////////////////////////////////////////////
// @param word - a bunch of characters comprising a word.
// @return array (one per letter) of 1s (capital) and 0s (lowercase) 
///////////////////////////////////////////////////////
var makeCapitalizationMask = function(word) {
  var mask = [], capitals = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (var x =0; x!=word.length; x++)
    mask.push((capitals.indexOf(word.charAt(x)) > -1) ? 1 : 0);
  return mask;
};

///////////////////////////////////////////////////////
// keeps the placement of capitals in words that were
// jumbled; not necessarily on the same character, but in 
// the same spot.
///////////////////////////////////////////////////////
var applyCapitalizationMask = function(word, mask) {
  var ltr = '', outword = '', x = 0;
  
  for (x = 0; x !== mask.length; x++) {
    ltr = word.charAt(x);
	outword+= '' + ((mask[x]) ? ltr.toUpperCase() : ltr.toLowerCase());
  }
  return outword;
};


///////////////////////////////////////////////////////////////////
// reorderWords - makes words jumbled, but readable.
// given an array of words and symbols, reorder the inner letters
// (2nd -> 2nd to last) of contents of words > than 3 letters
// but apply a bit-mask to preserve capitalizations!
// also - if we're dealing with plurals, there's lots of gotchas
// 
// @param array - an array of words and single character symbols
// @returns array - an array of jumbled words and single symbols.
///////////////////////////////////////////////////////////////////
var reorderWords = function(words) {
  var jumble, jumbled = [], word, mask = [], pl = 0, x = 0, iter = 0;
  for (x = 0; x !== words.length; x++) {
    word = words[x];
    if (word.length > 3) {
      if (word.indexOf(':') !== -1) {
        jumble = word;
      } else {
        mask = makeCapitalizationMask(word);
        pl = (isPlural(word)) ? true   : false;
        if (pl && word.length === 4) {
          jumbled.push(word);
        } else {
          for (iter = 0; iter !== 100; iter++) {
            jumble = shuffle(word.substr(1, word.length-(pl + 2)).split('')).join('');
            jumble = applyCapitalizationMask(word.substr(0, 1) + jumble + word.substr(word.length-(pl + 1),(pl + 1)), mask);
            if (jumble !== word) break;
          }
        }
      }
      jumbled.push(jumble);
    } else {
      jumbled.push(word);
    }
  }
  return jumbled;
};

var textJumble = function(txt) {
  var words = splitwords(txt);
  return reorderWords(words).join('');
};

var reorderTitle = function() {
  document.getElementById('title').innerHTML = textJumble(document.getElementById('title').innerHTML);
}

setInterval('reorderTitle()', 700);

