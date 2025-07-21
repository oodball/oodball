// import { inglorious_bagels } from './1_inglorious_bagels.js';
// import {tacos_el_gordo } from './2_tacos_el_gordo.js';
// import { ellens_house } from './3_ellens_house.js';
import { mitchs_seafood } from './4_mitchs_seafood.js';
import { cesarina } from './5_cesarina.js';
// import { shank_and_bone } from './6_shank_and_bone.js';
import { chez_lionel } from './7_chez_lionel.js';
import { template_entry } from './template.js';

export const allEntries = [
  // inglorious_bagels,
  // tacos_el_gordo,
  // ellens_house,
  mitchs_seafood,
  cesarina,
  // shank_and_bone,
  chez_lionel,
];

export const templateEntry = template_entry;

export const sortedEntries = allEntries.sort((a, b) => 
  new Date(b.timestamp) - new Date(a.timestamp)
); 