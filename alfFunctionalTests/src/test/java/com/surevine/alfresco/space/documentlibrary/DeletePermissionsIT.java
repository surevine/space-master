package com.surevine.alfresco.space.documentlibrary;

import org.junit.Test;

import static com.surevine.alfresco.space.common.ApplicationConstants.*;
import com.surevine.alfresco.space.common.SeleniumConstants;
import com.surevine.alfresco.space.common.SpaceTestBase;

public class DeletePermissionsIT extends SpaceTestBase {
	
	private static final String TEST_FOCUS = "Document Library";
	private static final String TEST_FOCUS_LINK = SeleniumConstants.LINK_STR + TEST_FOCUS;
	
	private static final String TEST_FILE_LINK = SeleniumConstants.LINK_STR + "profile.jpg";
	
	public void setUp() throws Exception {
		setUp(SpaceTestBase.PROTOCOL + "://" + ALFRESCO_HOST + "/cas/login?service=" + SpaceTestBase.PROTOCOL + "://" + ALFRESCO_HOST + APPLICATION_CONTEXT, "*" + SpaceTestBase.BROWSER);
	}
	
	/**
	 * Test that normal users are denied the ability to delete folders and files from the document library.
	 * 
	 * Login as an admin user and navigate to the document library, select both the test folder and 
	 * test files and ensure that the delete link is not available.
	 * 
	 * @throws Exception
	 */
	@Test
	public void testDeleteDeniedForNormalUser() throws Exception {
		
		this.login(NORMAL_USER_NAME, NORMAL_USER_PASSWORD);

		click(SITE_NAME_LINK);
		
		clickAndWait(TEST_FOCUS_LINK);
		verifyFalse(selenium.isTextPresent(DELETE_STR));
		
		clickAndWait(TEST_FILE_LINK);
		verifyFalse(selenium.isTextPresent(DELETE_STR));

	}

	
	/**
	 * 
	 * @throws Exception
	 */
	@Test
	public void testDeletePermittedForAdminUser() throws Exception {
		this.login(ADMIN_USER_NAME, ADMIN_USER_PASSWORD);
		
		click(SITE_NAME_LINK);

		clickAndWait(TEST_FOCUS_LINK);
		clickAndWait(TEST_FILE_LINK);

		verifyTrue(selenium.isTextPresent(DELETE_STR));
	}

}
