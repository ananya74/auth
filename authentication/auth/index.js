const express=require('express');
const jwt=require("jsonwebtoken");
const jwtPass="123456";
const app=express();

app.use(express.json());

const ALL_USERS=[
  {
    username:"harkirat@gmail.com",
    password:"123",
    name:"harkirat singh"
  },
  {
    username:"ram@gmail.com",
    password:"123",
    name:"ram"
  },
  {
    username:"priyal@gmail.com",
    password:"123",
    name:"Priyal singh"
  },
];

function userExists(username,password){
  let userExists=false;
  for(let i=0;i<ALL_USERS.length;i++){
    if(ALL_USERS[i].username===username && ALL_USERS[i].password===password){
      userExists=true;
    }
  }
  return userExists;
}

app.post("/signin",function(req,res){
  const username=req.body.username;  
  const password=req.body.password;
  if(!userExists(username,password)){
    return res.status(403).json({
      msg:"user doesnt exist in our in memory db"
    });
  }
//encryption
  var token = jwt.sign({ username: username }, jwtPass);
  return res.json({
    token,
  });
});

app.get("/users",function(req,res){
  const token=req.headers.authorization;
  try{
    const decoded=jwt.verify(token,jwtPass);
    const username=decoded.username;
    // return a list of users other than this username
    const filteredUsers = ALL_USERS.filter(user => user.username !== username);
    return res.json({
      users: filteredUsers
    });
  }
  catch(err){
    return res.status(403).json({
      msg:"Invalid token"
    })
  };
});
app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});