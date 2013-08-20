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
