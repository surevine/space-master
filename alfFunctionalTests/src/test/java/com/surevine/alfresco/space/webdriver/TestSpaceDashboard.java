package com.surevine.alfresco.space.webdriver;

import junit.framework.Assert;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.firefox.internal.ProfilesIni;
import org.openqa.selenium.support.PageFactory;

import static org.junit.Assert.*;

public class TestSpaceDashboard {

	private SpaceDashboard space;
	private CasLogin casLoginPage;
	private DocumentLibraryPage docLibraryPage;
	
	@Before
	public void openTheBrowser() {
		

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
	public void closeTheBrowser() {
		casLoginPage.close();
	}
	
	@Test
	public void loadDocumentLibrary() {
		// this is a more interesting test as it will load the document library which is AJAX based.
		SiteDashBoard sitePage = space.navigateToSite("Test Site 4 Site");
		
		docLibraryPage = sitePage.navigateToDocumentLibrary();
		
		WebElement testDoc = docLibraryPage.getDocumentLink("test_document.txt");
		
		assertNotNull(testDoc);
		
	}
}