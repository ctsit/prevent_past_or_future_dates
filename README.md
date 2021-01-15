## Past Future Date Tags
This REDCap module adds actions tags __@PREVENT-FUTUREDATE__ and __@PREVENT-PASTDATE__ that can be applied to date fields-—i.e., a text field with date validation applied.

### Scenarios

|               | Applied Tags  | Dates available in Datepicker |
| ------------- | ------------- | ------------- |
| Scenario 1    | @PREVENT-FUTUREDATE  | past - today  |
| Scenario 2    | @PREVENT-PASTDATE  | today - future  |
| Scenario 3    | @PREVENT-FUTUREDATE && @PREVENT-PASTDATE  | today  |


### Known Limitations
The dates available in the datepicker are as of the current day, it is not relative to a specific date nor when an instrument was saved. Therefore, revisiting an instrument with tagged date fields a day or more later can result in:

|               | Applied Tags  | Original Date Selected | (Original) Dates available in Datepicker | (+1D) Dates available in Datepciker
| ------------- | ------------- | ------------- | ------------- | ------------- |
| Scenario 1    | @PREVENT-FUTUREDATE  | 01/14/2021  | past - 01/14/2021 | past - 01/15/2021 |
| Scenario 2    | @PREVENT-PASTDATE  | 01/14/2021  | 01/14/2021 - future | 01/15/2021 - future |
| Scenario 3    | @PREVENT-FUTUREDATE && @PREVENT-PASTDATE  | 01/14/2021  | 01/14/2021 | 01/15/2021 |