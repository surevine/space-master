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
