
This is the code for Russell's website.

This version is Homestead / Vagrant

To run locally in Chrome:

    http://russ.test

    http://russ.test/auth/login

    with betheridge@gmail.com / Cando

Use GIT.

Mysql:

    use the vagrant ssh command line:
	
		mysql -uroot -psecret
		
	GRANT ALL ON russ_201910.* TO russ@'localhost' IDENTIFIED BY 'Canopy84';
	GRANT ALL ON russ_20200607.* TO russ@'localhost' IDENTIFIED BY 'Canopy84';

# 20200622 Switched on Let's Encrypt and added the https redirect in .htaccess
# 20200809 There was a delayed redirect to russetheridge.com in the app layout, but Russ
    requested that it redirect immediately so I placed a 301 in the .htaccess for the site

    Redirect 301 / https://russetheridge.com/

