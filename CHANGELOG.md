# Change Log
All notable changes to Prevent Past or Future Dates will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).

## [1.0.2] - 2021-04-15
### Added
Add minimum REDCap and PHP version (Michael Bentz)

### Changed
Remove eval() in js (Michael Bentz)


## [1.0.1] - 2021-04-12
### Added
 - Add Zenodo DOI to README (Kyle Chesney)


## [1.0.0] - 2021-04-12
### Summary
 - Initial release of Prevent Past or Future Dates
 - Adds actions tags __@PREVENT-FUTUREDATE__ and __@PREVENT-PASTDATE__ that can be applied to date fields to disallow entry of dates in the future or past, respectively
 - The action tags will _only_ apply to empty fields
