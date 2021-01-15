## Past Future Date Tags
This REDCap module adds actions tags __@PREVENT-FUTUREDATE__ and __@PREVENT-PASTDATE__ that can be applied to date fields-—i.e., a text field with date validation applied.

### Scenarios

|               | Applied Tags  | Dates available in Datepicker |
| ------------- | ------------- | ------------- |
| Scenario 1    | @PREVENT-FUTUREDATE  | past - today  |
| Scenario 2    | @PREVENT-PASTDATE  | today - future  |
| Scenario 3    | @PREVENT-FUTUREDATE && @PREVENT-PASTDATE  | today  |