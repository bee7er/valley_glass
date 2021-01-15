
This is the code for the Valley Glass website.

This version runs in Homestead / Vagrant

To run locally in Chrome:

    http://valley_glass.test

    http://valley_glass.test/auth/login

    with betheridge@gmail.com / Cando

Use GIT.

Mysql:

    use the vagrant ssh command line:
	
		mysql -uroot -psecret

		create database valley_glass_202101;
		
	GRANT ALL ON valley_glass_202101.* TO brian@'localhost' IDENTIFIED BY 'Thylocine2105';

	# Update statement for the templates table

	update templates set container='<div style="margin-top: 24px;text-align: left;"><div class="form-title">Please enter your details below and we will contact you to discuss your requirements.</div><form action="contact" id="contactForm" name="contactForm" method="post" class="" novalidate="novalidate"><input type="hidden" id="_token" name="_token" value=""><input type="hidden" name="update" value="1"><p>Your Name<br><span class=""><input type="text" name="contactName" value="" size="40" class=""></span></p><p>Your Email<br><span class=""><input type="email" name="contactEmail" value="" size="40" class=""></span> </p><p>Your Message<br><span class=""><textarea name="contactMessage" cols="40" rows="6" class=""></textarea></span></p><p><input type="submit" value="Send" class="submit-button"></p></form></div><br>' where id=30;


