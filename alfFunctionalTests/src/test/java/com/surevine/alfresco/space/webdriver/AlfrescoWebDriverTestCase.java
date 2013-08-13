package com.surevine.alfresco.space.webdriver;

import org.junit.After;
import org.junit.Before;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.firefox.internal.ProfilesIni;
import org.openqa.selenium.support.PageFactory;

public abstract class AlfrescoWebDriverTestCase {

	protected CasLogin casLoginPage;
	protected SpaceDashboard space;
	
	@Before
	public void openBrowserAndLogin() {
		ProfilesIni allProfiles = new ProfilesIni();
		FirefoxProfile profile = allProfiles.getProfile("selenium");
		
		// This looks counter-intuitive, but it works there has been lots of talk on the google groups about
		// the trusting and otherwise of ssl certificates.
		profile.setAcceptUntrustedCertificates(false);		
		FirefoxDriver ffd = new FirefoxDriver(profile);
		
		casLoginPage = PageFactory.initElements(ffd, CasLogin.class);
		casLoginPage.open("http://79.125.19.164/share");
		space = casLoginPage.login("admin", "password");
	}
	
	@After
	public void closeBrowser() {
		casLoginPage.close();
	}
}
