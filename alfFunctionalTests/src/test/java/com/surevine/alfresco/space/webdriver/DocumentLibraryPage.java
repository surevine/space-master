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
