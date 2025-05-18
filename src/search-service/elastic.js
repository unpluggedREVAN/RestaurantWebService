import { Client } from '@elastic/elasticsearch';

const esClient = new Client({
  node: 'http://elasticsearch:9200' // No uses localhost
});

export default esClient;
