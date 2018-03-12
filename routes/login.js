

//Redirects to the homepage
exports.redirectToHomepage = function(req,res)
{
    console.log("in redirect");
    //Checks before redirecting whether the session is valid
    if(req.session.username)
    {
        //Set these headers to notify the browser not to maintain any cache for the page being loaded
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("./dashboard",{username:req.session.username});
    }
    else
    {
        res.redirect('./login');
    }
};


//Logout the user - invalidate the session
exports.logout = function(req,res)
{
    req.session.destroy();
    console.log('Session destroyed');
    res.redirect('/');
};



exports.loginpage = function(req, res){
    res.render('./login', { title: 'Login Page' });
};
