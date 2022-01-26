const express= require('express');
const connectDB=require('./config/db');
const app=express();
connectDB(); 

//Init Middleware, helps us send json in req.body
app.use(express.json({
    extended:false
}));

app.get('/', (req,res) => res.send('API Running'));


//define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

const PORT= process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`));
 
