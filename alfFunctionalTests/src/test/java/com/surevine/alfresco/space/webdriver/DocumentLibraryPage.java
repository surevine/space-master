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

import java.lang.reflect.Field;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.pagefactory.AjaxElementLocator;

public class DocumentLibraryPage extends Page {

	public DocumentLibraryPage(WebDriver driver) {
		super(driver);
	}

	@FindBy(linkText="test_document.txt")
	WebElement docLink;

	public WebElement getDocumentLink(String string) {
		Field f = null;
		try {
			f = DocumentLibraryPage.class.getDeclaredField("docLink");
		} catch (SecurityException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NoSuchFieldException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		AjaxElementLocator ael = new AjaxElementLocator(driver, f, 15);
		
		return(ael.findElement());
	}

	public boolean hasDeletePermissions() {
		List<WebElement> actionLinks = driver.findElements(By.className("action-link"));
		
		for (WebElement actionLink : actionLinks) {
			if ("Delete Document".equals(actionLink.getAttribute("title"))) {
				return true;	
			}	
		}
		
		return false;
	}
	
	
}
