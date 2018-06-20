(function(){
    let path = require("path");

    let _ = require("lodash");

    let checkNupdateDb = (config, dburi) => {
        if(typeof config.databaseSetting === "object"){
            if(typeof config.databaseSetting.uri === "undefined") return true;
            let oldUri = config.databaseSetting.uri;
            let splitUri = oldUri.split("/");
            let dbName = splitUri[3];
            config.databaseSetting.uri = dburi + "/" + dbName;
        }
    };

    let updateFromRegistry =  (config) =>  {
        let file = path.resolve("./nodedb/config/registry.json");
        try{
            let registry = require(file);
            let updateStr = JSON.stringify(registry);
            let updateConfig = JSON.parse(updateStr);

            for(let key in updateConfig){
                config[key] = updateConfig[key];
                if(key === "dbUri") checkNupdateDb(config, updateConfig[key]);
            }
        }catch(e){
        }

        return config;
    };

    let configFile = (moduleName, filePath) => {

        let file = path.resolve(filePath);
        let config = {};
        try{
            let configReq = require(file);
            let strConfig = JSON.stringify(configReq);
            config = JSON.parse(strConfig);
            config = updateFromRegistry(config);
        }catch(e){
            throw new Error("Failed to load the JSON file. Please provide the correct path to the file");
        }
        config.configFilePath = filePath;
        config.moduleName = moduleName;
        config.logFile = moduleName + "log.log";
        config.tags = {
            MongoConnection     : "MongoConnection",
            MongoBeforeFind     : "MongoBeforeFind",
            MongoBeforeFindOne  : "MongoBeforeFindOne",
            MongoError          : "MongoError"
        };

        return config;

    };

    module.exports = (moduleName, filePath) => {
        return (new configFile(moduleName, filePath));
    };
})();