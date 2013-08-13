package com.surevine.alfresco.space.wiki;

import org.junit.Test;

import com.surevine.alfresco.space.common.ApplicationConstants;
import com.surevine.alfresco.space.common.SeleniumConstants;
import com.surevine.alfresco.space.common.SpaceTestBase;

/**
 * Integration test to ensure that delete priviledges are denied for normal users
 * and allowed for admin users.
 * 
 * @author garethferrier
 *
 */
public class DeletePermissionsIT extends SpaceTestBase {

	private static final String TEST_FOCUS = "Wiki";
	private static final String WIKI_PAGE_LIST_STR = "Wiki Page List";
	private static final String WIKI_PAGE_LIST_LINK = SeleniumConstants.LINK_STR + WIKI_PAGE_LIST_STR;
	private static final String TEST_FOCUS_LINK = SeleniumConstants.LINK_STR + TEST_FOCUS;
	
	private static final String TEST_WIKI_PAGE_TITLE = "Test WIKI page";
	private static final String TEST_WIKI_PAGE_LINK = SeleniumConstants.LINK_STR + TEST_WIKI_PAGE_TITLE;

	public void setUp() throws Exception {
		setUp(SpaceTestBase.PROTOCOL + "://" + ApplicationConstants.ALFRESCO_HOST + "/cas/login?service=" + SpaceTestBase.PROTOCOL + "://" + ApplicationConstants.ALFRESCO_HOST + ApplicationConstants.APPLICATION_CONTEXT, "*" + SpaceTestBase.BROWSER);
	}
	
	/**
	 * This test will ensure that delete permissions for a WIKI page are denied to a user
	 * with non-admin priviledges.
	 * 
	 * The test will navigate to a single WIKI page and verify that the text string 'delete' 
	 * is not present on the page.
	 * 
	 * @throws Exception
	 */
	@Test
	public void testDeleteDeniedForNormalUser() throws Exception {
		
		this.login(ApplicationConstants.NORMAL_USER_NAME, ApplicationConstants.NORMAL_USER_PASSWORD);
		
		click(ApplicationConstants.SITE_NAME_LINK);

		click(TEST_FOCUS_LINK);

		click(WIKI_PAGE_LIST_LINK);

		click(TEST_WIKI_PAGE_LINK);
		
		verifyFalse(selenium.isTextPresent(ApplicationConstants.DELETE_STR));

	}

	
	/**
	 * This test will ensure that delete permissions for a WIKI page are granted to a
	 * user with admin priviledges.
	 * 
	 * The test will navigate to a single WIKI page (it does not own) and verify that
	 * the text string 'delete' is present on the page.  It will not exercise the delete
	 * functionality directly, just its availability.
	 * 
	 * @throws Exception
	 */
	@Test
	public void testDeletePermittedForAdminUser() throws Exception {
		this.login(ApplicationConstants.ADMIN_USER_NAME, ApplicationConstants.ADMIN_USER_PASSWORD);
		click(ApplicationConstants.SITE_NAME_LINK);

		click(TEST_FOCUS_LINK);

		click(WIKI_PAGE_LIST_LINK);

		click(TEST_WIKI_PAGE_LINK);

		verifyTrue(selenium.isTextPresent(ApplicationConstants.DELETE_STR));
	}

}
