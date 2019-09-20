import http from 'http';
import path from 'path';
import firost from 'firost';
import getPort from 'get-port';

const module = {
  /**
   * Start a server to serve mock API calls
   * @param {string} servePath Path on disk to serve
   * @returns {string} Server url
   **/
  async startServer(servePath) {
    if (this.runningServer) {
      return false;
    }

    const serverPort = await getPort();
    const onRequest = async function(request, response) {
      const basename = firost
        .urlToFilepath(request.url)
        .slice(2)
        .replace(/\.php$/, '.json')
        .replace(/rand-([0-9]*)_/, '');
      const filepath = path.resolve(servePath, basename);

      // We find a matching file in the fixture path
      // If file does not exist, we return a 404
      if (!(await firost.exists(filepath))) {
        response.writeHead(404);
        response.end();
        return;
      }

      // We return the file content
      const content = await firost.read(filepath);
      response.end(content, 'utf-8');
    };
    const server = http.createServer(onRequest);

    // We wait until the server is ready to receive connections on the port, or
    // stop if it errors
    return await new Promise((resolve, reject) => {
      server.on('error', reject);
      server.listen(serverPort, () => {
        this.runningServer = server;
        resolve(`http://127.0.0.1:${serverPort}`);
      });
    });
  },

  /**
   * Close the running server and wait for its shutdown
   * @returns {Promise} Close event
   **/
  async closeServer() {
    return await new Promise(resolve => {
      this.runningServer.on('close', resolve);
      this.runningServer.close();
    });
  },
};

export default module;
