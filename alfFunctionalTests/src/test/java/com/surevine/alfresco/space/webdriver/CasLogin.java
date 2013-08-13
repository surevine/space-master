package com.surevine.alfresco.space.webdriver;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class CasLogin {
	protected WebDriver driver;
	
	public CasLogin(WebDriver newDriver) {
		driver = newDriver;
	}
	
	@FindBy(name="username")
	private WebElement usernameInputField;	
	
	@FindBy(name="password")
	private WebElement passwordInputField;
	
	@FindBy(name="submit")
	private WebElement submitButton;
	
	public SpaceDashboard login(final String username, final String password) {
		usernameInputField.clear();
		usernameInputField.sendKeys(username);
		passwordInputField.sendKeys(password);
		
		submitButton.click();
		
		return new SpaceDashboard(driver);
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
}
