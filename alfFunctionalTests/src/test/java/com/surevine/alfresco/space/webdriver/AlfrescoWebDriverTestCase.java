/*
 * Copyright (C) 2008-2010 Surevine Limited.
 *   
 * Although intended for deployment and use alongside Alfresco this module should
 * be considered 'Not a Contribution' as defined in Alfresco'sstandard contribution agreement, see
 * http://www.alfresco.org/resource/AlfrescoContributionAgreementv2.pdf
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
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
