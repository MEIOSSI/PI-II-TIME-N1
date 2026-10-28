const oracledb = require('oracledb');

console.log('Driver Oracle carregado!');
console.log('Versão:', oracledb.versionString);
console.log('Modo Thin:', oracledb.thin);