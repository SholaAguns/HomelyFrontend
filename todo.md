# Features
P0:
- authentication and login/logout issues
- Separate property data models
- ~~Updates when running stage 2 (SSE?)~~
- ~~Updates when running stage 3~~
- ~~error handling~~
- ~~Rating Criteria Page~~
- ~~Sharing project with other users~~
- ~~Project stats dashboard~~
- ~~favourites section~~
- ~~Improve Property data extraction~~



P1:
- Create search criteria without triggering search
- POI data gets caught off
- Review all caching strategies
- Export to csv feature
- prices types - per week, per month
- Project dashboard
- poi_search_radius_meters should be in Km or miles?
- Context service should not return/print api error
- ~~Support SavedLocation time calculation~~
- ~~Zoopla service~~
- ~~User settings page: change email, names, delete account~~
- ~~Use defined constants for search criteria~~
- ~~Context report section layout~~
- ~~Remove rating criteria from property list edit page~~
- ~~delete modal confirmation only~~
- ~~POI and Saved location rating by distance or time~~
- ~~Remove unused rating criteria and dealbreakers~~
- ~~Allow rerunning Stage 2~~


## P2:
- Admin dashboard
- Only include options for POI rating criteria that are included in project context options
- Only include options for Saved Location rating criteria that are included in project context options
- Site wide toaster use
- Any
- Site redesign and renaming
- formBuilder.group is deprecated
- animations method are deprecated
- split up rating services into separate files
- get rid of report_transformers.py
- Keep criterion score when deleting criterion?
- Record price frequency
- Social login
- logging
- ~~Tasklist~~
- ~~Comments~~
- ~~Rating override~~
- ~~Support dark mode~~
- ~~Endpoint for user to leave project~~

## P3:
- Energy Efficiency, EPC Rating, Square Area, Garden, Child Suitable, Furnished Status, Parking, Lease Length
- Use structural directive to handle permissions


## Bugs
- Retry all failed stage 2: http://localhost:4200/properties/d1929282-446d-467e-b292-82b8fac42683
-  Client error: {'search_criteria': {'bedrooms_min': [ErrorDetail(string='A valid integer is required.', code='invalid')], 'bedrooms_max': [ErrorDetail(string='A valid integer is required.', code='invalid')]}}
