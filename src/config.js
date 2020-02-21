const Fse = require('fs-extra');
const Path = require('path');
const SocksProxyAgent = require('socks-proxy-agent');
const HttpsProxyAgent = require('https-proxy-agent');

const isValidPath = require('is-valid-path');

const configDir = require('appdata-path').getAppDataPath('nhder');
const configFile = Path.join(configDir, 'config.json');
const tempDir = Path.join(configDir, 'temp');

const defaultConfig = {
	path: '',
	thread: 8,
	api_thread: 5,
	timeout: 30,
	deduplication: true,
	languages: ['chinese', 'japanese'],
	proxy: ''
};

class Config {
	constructor() {
		if (!Fse.existsSync(configFile)) {
			Fse.ensureDirSync(configDir);
			Fse.writeJsonSync(configFile, defaultConfig);
		}
		this.data = Fse.readJsonSync(configFile);
	}

	check() {
		for (let key in defaultConfig) {
			let err = false;
			switch (key) {
				case 'languages':
					if (!Array.isArray(this.data.languages)) err = true;
					break;

				case 'path':
					if (!isValidPath(this.data.path)) err = true;

				default:
					if (typeof this.data[key] != typeof defaultConfig[key]) err = true;
			}
			if (err) {
				this.data[key] = defaultConfig[key];
				confErr = true;
			}
		}

		if (this.data.path.length == 0) {
			console.error('You must set download path first!'.red + '\nTry ' + 'nhder --setting'.yellow);
			return false;
		}

		return true;
	}

	getProxyAgent() {
		let proxy = this.data.proxy;
		if (proxy.search('http://') === 0) return new HttpsProxyAgent(proxy);
		if (proxy.search('socks://') === 0) return new SocksProxyAgent(proxy, true);
		return false;
	}

	getConfig() {
		return this.data;
	}

	saveConfig(config = null) {
		if (config) this.data = config;
		Fse.writeJsonSync(configFile, this.data);
	}

	getConfigDir() {
		return configDir;
	}

	getTempDir() {
		return tempDir;
	}
}

module.exports = new Config();
