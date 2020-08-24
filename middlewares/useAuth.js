var express = require('express');
var models = require('../models');

var jwt = require('jsonwebtoken');
const { Maintainer } = models;

const secret = "SECRET";
  
module.exports = async function useAuth(req, res, next) {
  try {
    const token = req.headers['x-access-token'];
    /* Validation - isToken and isJWT */
    if(!token) return res.status(401).send({success:false, message: 'unauthorized'});
    else{
      try{
        const validation = token
        .split('.')
        .map(str => str.length > 0);

        if(validation.length < 3) return res.status(401).send({success:false, message: 'unauthorized'});
        else if(!validation.reduce((a, b) => a && b)) return res.status(401).send({success:false, message: 'unauthorized'});
      }
      catch(e){
        console.log(`[UseAuth]\tInvalid token is provided`);
        return res.status(401).send({success:false, message: 'unauthorized'});
      }
    }

    try{
      const validation = token.split('.')[0];
      const headerString = Buffer.from(validation, 'base64').toString('utf-8');
      const header = JSON.parse(headerString);
      
      if(header.alg != 'HS256') return res.status(401).send({success:false, message: 'unauthorized'});
    }
    catch(e){
        console.log(`[UseAuth]\tToken is corrupted`);
        return res.status(401).send({success:false, message: 'unauthorized'});
    }

    let tokenOwner = jwt.verify(token, secret);

    //Token owner fetch
    tokenOwner = await Maintainer.findOne({
        attributes : ['id', 'name'],
        where : {
            id : tokenOwner
        }
    });

    res.locals.user = tokenOwner;
    next();
  } catch(e) {
    console.log(e);
    return res.status(401).send({success:false, message: 'unauthorized'});
  }
};