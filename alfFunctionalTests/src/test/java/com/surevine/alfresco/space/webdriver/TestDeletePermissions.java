package com.surevine.alfresco.space.webdriver;

import org.junit.Test;

import static org.junit.Assert.*;

public class TestDeletePermissions extends AlfrescoWebDriverTestCase {
	
	@Test
	public void testDeletePermissionForAdminOnDocumentLibrary() {
		SiteDashBoard sitePage = space.navigateToSite("Test Site 3 Site");
		
		DocumentLibraryPage docLibraryPage = sitePage.navigateToDocumentLibrary();
		
		assertTrue(docLibraryPage.hasDeletePermissions());
	}

}
