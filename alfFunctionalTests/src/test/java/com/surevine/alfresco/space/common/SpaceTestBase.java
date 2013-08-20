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
package com.surevine.alfresco.space.common;

import com.thoughtworks.selenium.SeleneseTestCase;

public class SpaceTestBase extends SeleneseTestCase {

	public static final String PROTOCOL = "http";
	public static final String BROWSER = "chrome";

	
	/**
	 * Utility method to tidy up link navigation.
	 * 
	 * @param link the link to be clicked.
	 */
	public void click(final String link) {
		selenium.click(link);
		selenium.waitForPageToLoad(ApplicationConstants.DELAY);
	}
	
	
	/**
	 * Utility method to allow logging into the site.
	 * 
	 * @param username of the user to be logged in
	 * @param password of the user to be logged in
	 */
	public void login(final String username, final String password) {
		
		selenium.open(SpaceTestBase.PROTOCOL + "://" + ApplicationConstants.ALFRESCO_HOST + ApplicationConstants.APPLICATION_CONTEXT);
		selenium.type("username", username);
		selenium.type("password", password);
		click("submit");
	}
	
	public void clickAndWait(final String link) throws InterruptedException {
		click(link);
		// This is less than optimal, because of AJAX a wait for page load is insufficient.
		// There used to be a method on the api clickAndWait but can't find it
		// at the moment, so until its found this will need to do.
		wait(10);
	}
	
    /**
     * Wait for the passed in seconds.
     *
     * @param seconds
     *            Seconds to wait for.
     * @throws InterruptedException
     */
    public void wait(final int seconds) throws InterruptedException {

        int second = 0;
        while (true) {
            if (second >= seconds) {
                break;
            }
            Thread.sleep(1000);
            second++;
        }
    }
	
}
