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
package com.surevine.alfresco.space.common;

public class ApplicationConstants {

	public static final String NORMAL_USER_NAME = "garethf-surevine";
	public static final String NORMAL_USER_PASSWORD = System.getProperty("testuser.password");
	public static final String ADMIN_USER_NAME = "admin";
	public static final String ADMIN_USER_PASSWORD = System.getProperty("admin.password");
	public static final String ALFRESCO_HOST = System.getProperty("alfresco.host");
	public static final String SITE_NAME = "Test Site 3 Site";
	public static final String DELAY = "30000";
	public static final String DELETE_STR = "Delete";
	public static final String APPLICATION_CONTEXT = "/share";
	public static final String SITE_NAME_LINK = SeleniumConstants.LINK_STR + SITE_NAME;

}
