package com.surevine.alfresco.space.webdriver;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class SiteDashBoard extends Page {
	
	public SiteDashBoard(WebDriver driver) {
		super(driver);
	}

	public DocumentLibraryPage navigateToDocumentLibrary() {
		// The number of spaces in the Document library link appear to be confusing the driver, so use partialLinkText API instead.
		WebElement docLibraryLink = driver.findElement(By.partialLinkText("Document Library"));
		docLibraryLink.click();
		
		return new DocumentLibraryPage(driver);
	}
	
	
	
}
