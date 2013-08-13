package com.surevine.alfresco.space.webdriver;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class SpaceDashboard {

	protected WebDriver driver;
	
	public SpaceDashboard(WebDriver newDriver) {
		driver = newDriver;
	}
	
	@FindBy(name=" Wiki ")
	private WebElement wikiButton;	
	
	
	public void clickOnWiki() {
		wikiButton.click();
	}
	
	public void open(String url) {
		driver.get(url);
	}
	
	public void close() {
		driver.quit();
	}
	
	public String getTitle() {
		return driver.getTitle();
	}
	
	public SiteDashBoard navigateToSite(final String siteName) {
		WebElement site = driver.findElement(By.linkText(siteName));
		site.click();
		
		return new SiteDashBoard(driver);
	}
}
