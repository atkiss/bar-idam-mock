import { Router } from 'express';
import fs, { stat } from 'fs';
import path from 'path'

export default ({ config, db }) => {

  let api = Router();

  api.get('/details', (req, res) => {
    let token = req.header('Authorization');
    if (token && token.startsWith('Bearer ')){
      token = decodeURIComponent(token.substring(7, token.length));
    }
    console.log('token:' + token);
    if (token === 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJjbWMiLCJleHAiOjE1MzMyMzc3NjN9.3iwg2cCa1_G9-TAMupqsQsIVBMWg9ORGir5xZyPhDabk09Ldk0-oQgDQq735TjDQzPI8AxL1PgjtOPDKeKyxfg[akiss@reformMgmtDevBastion02') {
      res.status(200).send('ccpay_bubble');
      return;
    } else if (token === 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJjdHNjX3dvcmtfYWxsb2NhdGlvbiIsImV4cCI6MTU3MDAyNjE3Nn0.Y7u9WqS9R_P-ckt1ccYzJ_k5nrF7B6LXZDYT6LCalsxMUfgODdLvtDfDwuINRyvT3zYE2P2-EXI9bbdqjvzfaw') {
      res.status(200).send('divorce');
      return;
    }
    const user = db.find(token);
    console.log('user: ' + user);
    if (!user) {
      res.status(403).send('Unauthorized');
    }
    res.json(user);
  });

  api.post('/oauth2/authorize', (req, res) => {
    res.setHeader('content-type', 'application/json');
    res.status(200).send('{"code": "f3c68c69-4cc2-4dae-b0df-b95a4b69c6eb", "defaultUrl": "", "accessToken": ""}');
  });

  api.post('/user/registration', (req, res) => {
    res.status(409).send('{ "status": 409, "errorMessages": [ "The user is already registered." ]}');
  });

  api.delete('/session/:token', (req, res) => {
    res.status(204).send();
  })

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

  api.get('/logout', (req, res) => {
    res.redirect("http://localhost:3000/login");
  })

  api.post('/oauth2/token', (req, res) => {
    console.log(req.query);
    res.json({access_token: req.query.code});
  });

  api.post('/lease', (req, res) => {
    res.send('eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJjbWMiLCJleHAiOjE1MzMyMzc3NjN9.3iwg2cCa1_G9-TAMupqsQsIVBMWg9ORGir5xZyPhDabk09Ldk0-oQgDQq735TjDQzPI8AxL1PgjtOPDKeKyxfg[akiss@reformMgmtDevBastion02');
  });

  api.post('/payment-records', (req, res) => {
    console.log(req.body);
    if (req.body.payment_method === 'ALLPAY'){
      res.status(400).send({
        "timestamp": "2018-09-04T15:37:18.914+0000",
        "status": 400,
        "error": "Bad Request",
        "message": "JSON parse error: Cannot deserialize value of type `uk.gov.hmcts.payment.api.util.PaymentMethodType` from String \"ALLPAY\": value not one of declared Enum instance names: [CARD, CHEQUE, CASH, POSTAL_ORDER, BARCLAY_CARD, PBA]; nested exception is com.fasterxml.jackson.databind.exc.InvalidFormatException: Cannot deserialize value of type `uk.gov.hmcts.payment.api.util.PaymentMethodType` from String \"ALLPAY\": value not one of declared Enum instance names: [CARD, CHEQUE, CASH, POSTAL_ORDER, BARCLAY_CARD, PBA]\n at [Source: (PushbackInputStream); line: 3, column: 21] (through reference chain: uk.gov.hmcts.payment.api.dto.PaymentRecordRequest[\"payment_method\"])",
        "path": "/payment-records"
      });
    } else {
      res.status(200).send({
        "reference": "RC-1534-8634-8352-6509",
        "date_created": "2018-08-21T14:58:03.630+0000",
        "status": "Initiated",
        "payment_group_reference": "2018-15348634835"
      });
    }
  });

  api.post('/remission', (req, res) => {
    console.log(req.body);
    res.status(201).send({
      "remission_reference": "RM-1559-2207-2143-1903",
      "payment_group_reference": "2019-15592207213",
      "fee": {
        "id": 67383,
        "code": "FEE00007",
        "version": "3",
        "volume": 1,
        "calculated_amount": 550
      }
    });
  });
  
  api.get('/jurisdictions1', (req,res) => {
    fs.readFile('./resources/jurisdiction1.json', function (err, data) {
      if (err) throw err;
      let fees = JSON.parse(data);
      res.json(fees);
    });
  });

  api.get('/jurisdictions2', (req,res) => {
    fs.readFile('./resources/jurisdiction2.json', function (err, data) {
      if (err) throw err;
      let fees = JSON.parse(data);
      res.json(fees);
    });
  });

  api.get('/health**', (req, res) => {
    res.status(200).send({ status: 'UP'})
  });

  api.get('/cases/:caseref', (req, res) => {
    let status = 200;
    if(req.params.caseref.includes('1234')) {
      status = 404;
    }
    res.status(status).send();
  });

  api.post('/searchCases', (req, res) => {
    setTimeout(() => {
      let fileName = "";
      if (req.query.ctid === 'GrantOfRepresentation') {
        fileName = 'ccd_probate_search_result.json';
      } else if (req.query.ctid === 'MoneyClaimCase') {
        fileName = 'ccd_cmc_search_result.json';
      } else {
        fileName = 'ccd_search_result.json';
      }
      fs.readFile(`./resources/${fileName}`, function (err, data) {
        if (err) throw err;
        let resp = JSON.parse(data);
        res.json(resp);
      });
    }, 10000);
  });

  return api;
};
