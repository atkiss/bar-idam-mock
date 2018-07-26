import { Router } from 'express';
import fs from 'fs';
import path from 'path'

export default ({ config, db }) => {

  let api = Router();

  api.get('/details', (req, res) => {
    let token = req.header('Authorization');
    if (token && token.startsWith('Bearer ')){
      token = token.substring(7, token.length);
    }
    console.log('token:' + token);
    const user = db.find(token);
    if (!user) {
      res.status(403).send('Unauthorized');
    }
    res.json(user);
  });

  api.get('/fees', (req,res) => {
    fs.readFile('./resources/fees.json', function (err, data) {
      if (err) throw err;
      let fees = JSON.parse(data);
      const description = req.query.description || '';
      const feeVersionAmount = req.query.feeVersionAmount || '';
      if (!description && !feeVersionAmount) {
        res.json(fees);
      } else  if (description){
        res.json(fees.filter(fee => {
          if (fee.current_version && fee.current_version.description){
            return fee.current_version.description.includes(description);
          }
          return false;
        }));
      } else if (feeVersionAmount) {
        res.json(fees.filter(fee => {
          if (fee.current_version && fee.current_version.flat_amount){
            return fee.current_version.flat_amount.amount == feeVersionAmount;
          }
          return false;
        }));
      }
    });
  });

  api.get('/login', (req, res) => {
    const appDirArr = __dirname.split('/')
    const appDir = appDirArr.reduce((acc, current, index) => {
      if (current && index < appDirArr.length - 3){
        acc += '/' + current;
      }
      return acc;
    }, '');
    console.log(appDir);
    res.sendFile(path.join(appDir, '/resources/login.html'));
  })

  api.post('/oauth2/token', (req, res) => {
    console.log(req.body);
    res.json({access_token: req.body.code});
  });

  return api;
};
