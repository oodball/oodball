import home from './home';
import vienna from './vienna';
import munich from './munich';
import oxford from './oxford';
import portland from './portland';
import korea from './korea';
import hong_kong from './hong_kong';
import taiwan from './taiwan';
import regensburg from './regensburg';

export const ALBUM_ORDER = ["home","regensburg","vienna","munich","oxford","portland","korea","hong_kong","taiwan"];

const albums = {
  home: { title: 'Home', photos: home },
  vienna: { title: 'Vienna', photos: vienna },
  munich: { title: 'Munich', photos: munich },
  oxford: { title: 'Oxford', photos: oxford },
  portland: { title: 'Portland', photos: portland },
  korea: { title: 'Korea', photos: korea },
  hong_kong: { title: 'Hong Kong', photos: hong_kong },
  taiwan: { title: 'Taiwan', photos: taiwan },
  regensburg: { title: 'Regensburg', photos: regensburg },
};

export default albums;
