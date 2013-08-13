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
		// This is nasty, because of AJAX a wait for page load is insufficient.
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
