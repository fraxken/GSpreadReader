const https = require('https');
const { promisify } = require('util');

class GSpread {

    constructor({id,tab,titleHeader = false}) {
        if("undefined" === typeof(id)) {
            throw new Error('ID cannot be undefined!');
        }
        if(typeof(id) !== 'string') {
            throw new Error('Spreadsheet ID should be a string!');
        }
        this.id = id;
        this.tab = "undefined" === typeof(tab) ? 1 : tab;
        this.titleHeader = titleHeader;
    }

    getData() {
        return new Promise((resolve,reject) => {
            const url = `https://spreadsheets.google.com/feeds/cells/${this.id}/${this.tab}/public/basic?alt=json&v=3.0`;
            https.get(url, (res) => {
                if(res.statusCode !== 200) {
                    reject(`Failed to get JSON data :: error code => ${res.statusCode}`);
                    return;
                }

                const data = [];
                res.on('data', (d) => {
                    data.push(d);
                });

                res.on('end', () => {
                    try {
                        this.data = JSON.parse(data.join(''));
                        this._parseJSONSheet();
                        resolve(this.data);
                    }
                    catch(E) {
                        reject(E);
                        return;
                    }
                });

            }).on('error', (e) => {
                console.error(e);
                reject(e);
            });
        });
    }

    _parseJSONAuthors(chunk) {
        const ret = [];
        chunk.forEach( _O => {
            ret.push({
                name: _O.name['$t'], 
                email: _O.email['$t']
            });
        });
        return ret;
    }

    _parseEntry(chunk) {
        const ret = new Map();
        const titlesMap = new Map();
        chunk.forEach( (_O,rId) => {
            const title     = _O.title['$t'];
            const content   = _O.content['$t'];
            const id        = title.substr(1);
            const column    = title.charAt(0);

            if(this.titleHeader === true) {
                if(id === "1") {
                    titlesMap.set(column,content);
                }
            }
            else {
                if(ret.has(id) === true) {
                    ret.get(id).push(content);
                    return;
                }
                ret.set(id,[content]);
            }
        });

        if(this.titleHeader === true) {
            chunk.forEach( (_O) => {
                const title     = _O.title['$t'];
                const content   = _O.content['$t'];
                const id        = title.substr(1);
                const column    = titlesMap.get(title.charAt(0));
                if(ret.has(id) === false) {
                    ret.set(id,{});
                }
                ret.get(id)[column] = content;
            });
        }
        return ret;
    }

    _parseJSONSheet() {
        this.authors    = this._parseJSONAuthors(this.data.feed.author);
        this.title      = this.data.feed.title['$t'];
        this.updated    = new Date(this.data.feed.updated['$t']);
        this.rows       = this._parseEntry(this.data.feed.entry);
    }

}

module.exports = GSpread;