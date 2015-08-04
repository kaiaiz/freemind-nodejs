/*!
 * freemind
 * Copyright(c) 2014-2015 胡时玮 mailto:wp3xpp@163.com
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
var Q = require('q');
var crypto = require('crypto');
var logger = require('../logger.js');
var models = require('../models.js');

exports.handle404 = function handle404(req, res){
	res.writeHead(404);
	res.render('404.html', {});
};

exports.handle500 = function handle500(req, res){
	res.writeHead(500, {'Content-Type': 'text/html; charset=utf8'});
	res.end('500 Internal server error!\n');
};


exports.index = function index(req, res){
	try{
		res.render('index.html', {}); 
	}
	catch(e){
		logger.error(e.toString());
	}
};

exports.login = function login(req, res){
	try{
		res.render('login.html', {}); 
	}
	catch(e){
		logger.error(e.toString());
	}
};

exports.register = function register(req, res){
	try{
		res.render('register.html', {});
	}
	catch(e){
		logger.error(e.toString());
	}
};

var getHash = function(str){
	var shasum = crypto.createHash('sha1');
	return shasum.update(str).digest('hex');
};

var salt = "freemind"; //给密码加盐

exports.api_register_user = function api_register_user(req, res){
	if (req.body.email === undefined || req.body.passwd === undefined){
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
		res.end("post数据传输过程中丢失");
	}
	try{
		var emailExist = function(req, res){
			var deferred = Q.defer();
			models.users.exists({email: req.body.email}, function(err, exists){
				if(exists){
					deferred.reject(res);
				}
				else{
					deferred.resolve({req:req, res:res});
				}
			});
			return deferred.promise;
		}
		
		emailExist(req, res).then(function(func){
			models.users.create({email : func.req.body.email,
				passwd : getHash(salt + func.req.body.passwd), 
				admin : true, 
				name : func.req.body.name
			},function(err){
				if(err){
					logger.error(err.toString());
					throw err;
				}
				func.res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
				func.res.end("success create");
			});
		})
		.fail(function(res){
			logger.info(typeof res);
			res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
			res.end("邮箱已经被注册了,不好意思啊");
		});
		
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.manageBlogs = function manageBlogs(req, res){
	try{
		res.render('manageBlogs.html', {layout:'manage_base.html'});
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.manageUsers = function manageBlogs(req, res){
	try{
		res.render('manageUsers.html', {layout:'manage_base.html'});
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.getUsers = function getUsers(req, res){
	try{
		models.users.find({}, ["created_at", "Z"], function(err, users){
			if(err){
				throw err;
			}
			for(var user of users){
				user.passwd = "******";
				user.created_at = new Date(user.created_at).toLocaleString();
			}
			return res.json(users);
		});
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.getBlogs = function getUsers(req, res){
	try{
		models.blogs.find({}, ["created_at", "Z"], function(err, blogs){
			if(err){
				throw err;
			}
			for(var blog of blogs){
				blog.created_at = new Date(blog.created_at).toLocaleString();
			}
			return res.json(blogs);
		});
	}
	catch(err){
		logger.error(err.toString());
	}
};


exports.api_get_blog = function api_get_blog(req, res){
	try{
		models.blogs.find({blog_id: req.params.blogid}, 1, function(err, blog){
			if(err){
				throw err;
			}
			res.json(blog[0]);
		});	
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.showBlog = function showBlog(req, res){
	try{
		models.blogs.find({blog_id: req.params.blogid}, 1, function(err, blog){
			if(err){
				throw err;
			}
			if(blog[0]){
				res.render("blog.html", {blog_id: blog[0].blog_id});
			}
			else{
				exports.handle404(req, res);
			}
		});	
	}
	catch(err){
		logger.error(err.toString());
	}
};