
This is the code for the Valley Glass website.

This version runs in Homestead / Vagrant

To run locally in Chrome:

    http://valley_glass.test

    http://valley_glass.test/auth/login

    with betheridge@gmail.com / Cando

Use GIT.  Had to set up SSH access to github

    https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh

Then set the repo details for valley_glass to use SSH

    git remote set-url origin git@github.com:bee7er/valley_glass.git

Mysql:

    use the vagrant ssh command line:
	
		mysql -uroot -psecret

		mysqldump -uroot -psecret valley_glass_202101 > db.sql

		drop database valleygl_vg;

		create database valleygl_vg;

	    GRANT ALL ON valleygl_vg.* TO brian@'localhost' IDENTIFIED BY 'Thylocine2105';

	    source db.sql;

	# Update statement for the templates table

	update templates set container='<div style="margin-top: 24px;text-align: left;"><div class="form-title">Please enter your details below and we will contact you to discuss your requirements.</div><form action="contact" id="contactForm" name="contactForm" method="post" class="" novalidate="novalidate"><input type="hidden" id="_token" name="_token" value=""><input type="hidden" name="update" value="1"><p>Your Name<br><span class=""><input type="text" name="contactName" value="" size="40" class=""></span></p><p>Your Email<br><span class=""><input type="email" name="contactEmail" value="" size="40" class=""></span> </p><p>Your Message<br><span class=""><textarea name="contactMessage" cols="40" rows="6" class=""></textarea></span></p><p><input type="submit" value="Send" class="submit-button"></p></form></div><br>' where id=30;


mysql -uroot -psecret valleygl_vg

# Update the key in words
SET @row_number = 0;
UPDATE words SET wordno = (@row_number:=@row_number + 1);
LIMIT 2;

alter table words drop foreign key words_unique;

alter table words drop index words_unique;

ALTER TABLE words ADD CONSTRAINT words_unique UNIQUE KEY(wordno);