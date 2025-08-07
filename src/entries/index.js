import { inglorious_bagels } from './1_inglorious_bagels.js';
import { mitchs_seafood } from './2_mitchs_seafood.js';
import { cesarina } from './3_cesarina.js';
import { shank_and_bone } from './4_shank_and_bone.js';
import { chez_lionel } from './5_chez_lionel.js';
import { fromagerie_lemaire } from './6_fromagerie_lemaire.js';
import { portofino_brasserie_italienne } from './7_portofino_brasserie_italienne.js';
import { chez_chili } from './8_chez_chili.js';
import { osmows_shawarma } from './9_osmows_shawarma.js';
import { khao_thai } from './10_khao_thai.js';

export const allEntries = [
  inglorious_bagels,
  mitchs_seafood,
  cesarina,
  shank_and_bone,
  chez_lionel,
  fromagerie_lemaire,
  portofino_brasserie_italienne,
  chez_chili,
  osmows_shawarma,
  khao_thai,
];


export const sortedEntries = allEntries.sort((a, b) => 
  new Date(b.timestamp) - new Date(a.timestamp)
); 