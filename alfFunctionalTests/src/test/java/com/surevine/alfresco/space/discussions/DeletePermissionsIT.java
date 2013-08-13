package com.surevine.alfresco.space.discussions;

import org.junit.Test;

import com.surevine.alfresco.space.common.ApplicationConstants;
import com.surevine.alfresco.space.common.SeleniumConstants;
import com.surevine.alfresco.space.common.SpaceTestBase;

public class DeletePermissionsIT extends SpaceTestBase {
	private static final String TEST_FOCUS = "Discussions";
	private static final String TEST_FOCUS_LINK = SeleniumConstants.LINK_STR + TEST_FOCUS;
	private static final String TEST_DISCUSSION_LINK = SeleniumConstants.LINK_STR + "TEST Discussion topic";
	
	public void setUp() throws Exception {
		setUp(SpaceTestBase.PROTOCOL + "://" + ApplicationConstants.ALFRESCO_HOST + "/cas/login?service=" + SpaceTestBase.PROTOCOL + "://" + ApplicationConstants.ALFRESCO_HOST + ApplicationConstants.APPLICATION_CONTEXT, "*" + SpaceTestBase.BROWSER);
	}
	
	/**
	 * Test that normal users are not permitted the ability to delete discussions.
	 * 
	 *  Navigate to the discussions section of the site, and select a discussion.
	 *  Verify that a delete link is not available.
	 * 
	 * @throws Exception
	 */
	@Test
	public void testDeleteDeniedForNormalUser() throws Exception {
		
		this.login(ApplicationConstants.NORMAL_USER_NAME, ApplicationConstants.NORMAL_USER_PASSWORD);
		
		click(ApplicationConstants.SITE_NAME_LINK);
		clickAndWait(TEST_FOCUS_LINK);
		click(TEST_DISCUSSION_LINK);
		
		verifyFalse(selenium.isTextPresent(ApplicationConstants.DELETE_STR));
		
	}

	
	/**
	 * Test that admin users are permitted the ability to delete discussions.
	 * 
	 * Navigate to the discussions section of the site, and select a discussion.
	 * Verify that a delete link is available.
	 * 
	 * @throws Exception
	 */
	@Test
	public void testDeletePermittedForAdminUser() throws Exception {
		
		this.login(ApplicationConstants.ADMIN_USER_NAME, ApplicationConstants.ADMIN_USER_PASSWORD);
		
		click(ApplicationConstants.SITE_NAME_LINK);

		clickAndWait(TEST_FOCUS_LINK);
		click(TEST_DISCUSSION_LINK);
		
		verifyFalse(selenium.isTextPresent(ApplicationConstants.DELETE_STR));
	}
}
