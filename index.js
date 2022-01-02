const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session')
const flash = require('express-flash')


const db = require('./connection/db')
const upload = require('./middlewares/uploadFile')

const app = express()
const port = process.env.PORT || 5000;

// Untuk menerima data objek berupa string atau array
app.use(express.urlencoded({ extended: false }));

// Setup View Engine
app.set('view engine', 'hbs')

// Setup Public Folder
app.use(express.static('public'))

app.use(express.static('uploads'))


// Setup session
app.use(session({
    cookie: {
        maxAge: 2*60*60*1000,
        secure: false,
        httpOnly: true
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: "secretValue"
}))

// Setup flash
app.use(flash())

app.get('/', (req,res)=>{

    db.connect(function(err, client, done){
        if(err) throw err

        client.query('SELECT * FROM project', function(err,result){
            if(err) throw err
            let data = result.rows
            // console.log(data)

            res.render('home', {table: data})
        })
    })
    
})

app.get('/blog', (req,res)=>{

    let query = `SELECT blog.id, title, content, image, post_at, name AS author
	                FROM blog LEFT JOIN tb_user
                	ON blog.author_id = tb_user.id`
    
    db.connect(function(err, client, done){
        if(err) throw err

        client.query(query, function(err,result){
            if(err) throw err
            let data = result.rows
            let dataBlogs = data.map(function(blog){
                return {
                    ...blog,
                    post_at : getPostTime(blog.post_at),
                    post_time : getDistanceTime(blog.post_at),
                    isLogin : req.session.isLogin
                }
            })
            // console.log(dataBlogs)

            res.render('blog',
             {isLogin: req.session.isLogin,
              blogs: dataBlogs,
              user: req.session.user
            })
        })
    })

})

app.post('/blog', upload.single('image'), (req,res)=>{
    let data = req.body;

    if(!req.session.isLogin){
        req.flash('danger', 'Please Login !!')
        return res.redirect('/add')
    }

    let authorId = req.session.user.id
    let image = req.file.filename
 
    // console.log(data)
    if(!data.title || !data.content || !image ){
        req.flash('danger', "All Input Must Be Filled!")
        res.redirect('/add')
    }else{
        const query = `INSERT INTO blog( title, content, image, author_id) VALUES ('${data.title}', '${data.content}', '${image}', '${authorId}')`;
        // console.log(query)
    
        db.connect(function(err, client, done){
            if(err) throw err
       
            client.query(query, function(err, result){
                if(err) throw err
                
                res.redirect('/blog')
            }) 
        })
    
    }
    
})


app.get('/update/:id', (req,res)=>{
    const id = req.params.id;
    
    db.connect(function(err, client, done){
        if(err) throw err
        console.log('berhasil')

        let query = `SELECT * FROM blog WHERE id=${id}`
        client.query(query, function(err,result){
            if(err) throw err
            let data = result.rows[0]
            // console.log(data)

            res.render('update', {id: id, edit: data})
        })
    })
})

app.post('/edit/:id', upload.single('image'), (req, res)=>{
    let id = req.params.id
    let data = req.body;

    let image = req.file.filename

    const query = `UPDATE blog SET title =' ${data.title}', content = '${data.content}', image = '${image}' WHERE id = ${id} `;
        // console.log(query)
    
        db.connect(function(err, client, done){
            if(err) throw err
       
            client.query(query, function(err){
                if(err) throw err
                res.redirect('/blog')
            })
            
        })
      
})


app.get('/delete-blog/:id', (req,res)=>{
    let id = req.params.id;
    const query = `DELETE FROM blog WHERE id=${id}`;
    // console.log(data)

    db.connect(function(err, client, done){
        if(err) throw err
   
        client.query(query, function(err, result){
            if(err) throw err
            
            res.redirect('/blog')
        })
    })
})


app.get('/register', (req,res)=>{
    res.render('register')
})

app.post('/register', (req,res)=>{
    const data = req.body
    const hassedPassword = bcrypt.hashSync(data.password, 10)

    let query = `INSERT INTO tb_user( name, email, password) VALUES ('${data.name}', '${data.email}', '${hassedPassword}')`;

    db.connect(function(err, client, done){
        if(err) throw err

        client.query(query, function(err, result){
            if(err) throw err
            res.redirect('/login')
        })
    })

})

app.get('/login', (req,res)=>{
    // console.log(req.session)
    res.render('login')
})

app.post('/login', (req,res)=>{
    const {email, password} = req.body
    let query = `SELECT * FROM tb_user WHERE email = '${email}'`

    db.connect(function(err, client, done){
        if(err) throw err

        client.query(query, function(err, result){
            if(err) throw err

            if(result.rows.length == 0){
               req.flash('danger', "Email and Password don't match !")
               return res.redirect('/login')
            }

            let isMatch = bcrypt.compareSync(password, result.rows[0].password)

           if(isMatch){
               req.session.isLogin = true
               req.session.user = {
                   id : result.rows[0].id,
                   name : result.rows[0].name,
                   email : result.rows[0].email
               }
               
               req.flash('success', 'Login Success')
               res.redirect('/blog')
           }else{
               req.flash('danger', "Email and Password don't match !")
               res.redirect('/login')
           }

        })
    })
})

app.get('/blog-detail/:id', (req,res)=>{
    let id = req.params.id

    db.connect(function(err, client, done){
        if(err) throw err

        let queryy =  `SELECT blog.id, title, content, image, post_at, name AS author
                        FROM blog LEFT JOIN tb_user
                        ON blog.author_id = tb_user.id`
        // console.log(queryy)

        client.query(queryy, function(err,result){
            if(err) throw err
            let data = result.rows[0]
            // data = {
            //     title: data.title,
            //     content: data.content,
            //     Image: data.image,
            //     author: data.author,
            //     post_at: getPostTime(data.post_at)
            // }
            console.log(data.image)
            
            res.render('blog-detail', {id: id, blog: data})
        })
    })
    
})

app.get('/add', (req,res)=>{
    res.render('add-blog',  {
        isLogin: req.session.isLogin,
        user: req.session.user
      })
})

app.get('/contact', (req,res)=>{
    res.render('contact')
})

app.get('/logout', (req,res)=>{
    req.session.destroy()
    res.redirect('/blog')
})
app.listen(port, ()=>{
    console.log(`app is running at port : ${port}`)
})

// TIME FUNCTION
function getPostTime(time){
    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()
    let hours = time.getHours()
    let minutes = time.getMinutes()

    let postTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`;
    return postTime;
}

let month = [
    'January',
    'February',
    'April',
    'March',
    'May', 
    'June', 
    'July', 
    'August', 
    'September', 
    'October', 
    'November', 
    'December'
]

function getDistanceTime(time){
    let timePost = time;
    let timeNow = new Date();
  
    let distance = timeNow - timePost;
  
    //convert waktu
    let milliseconds = 1000; //milliseconds in 1 seconds
    let secondsInHours = 3600; //Second in 1 hours
    let hoursInDay = 23; //hours in 1 day
  
    let distanceDay = Math.floor(distance / (milliseconds * secondsInHours * hoursInDay));
    let distanceHours = Math.floor(distance / (1000 * 60 * 60));
    let distanceMinutes = Math.floor(distance / (1000 * 60));
    let distanceSeconds = Math.floor(distance / 1000);
  

    if (distanceDay >= 1) {
      return `${distanceDay} days ago`;
    } else { 
      if (distanceHours >= 1) {
        return `${distanceHours} hours ago`;
      } else {
        if (distanceMinutes >= 1) {
          return ` ${distanceMinutes} minutes ago`;
        } else {
          console.log(distanceSeconds);
          return `${distanceSeconds} seconds ago`;
        }
      }
    }
}
