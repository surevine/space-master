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
