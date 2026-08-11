import home from './home';
import munich from './munich';
import oxford from './oxford';
import portland from './portland';
import korea from './korea';
import hong_kong from './hong_kong';
import taiwan from './taiwan';

export const ALBUM_ORDER = ["home","munich","oxford","portland","korea","hong_kong","taiwan"];

const albums = {
  home: { title: 'Home', photos: home },
  munich: { title: 'Munich', photos: munich },
  oxford: { title: 'Oxford', photos: oxford },
  portland: { title: 'Portland', photos: portland },
  korea: { title: 'Korea', photos: korea },
  hong_kong: { title: 'Hong Kong', photos: hong_kong },
  taiwan: { title: 'Taiwan', photos: taiwan },
};

export default albums;
