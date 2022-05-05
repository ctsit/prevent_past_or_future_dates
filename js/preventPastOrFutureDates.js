/*  Scenarios
 *  Option 1: Change returntype = "hard"
 *  Pros: Proper date validation, no additional code
 *  Cons: Cannot override alert message, cannot focus field on failed validation
 *  Note: Overriding soft_typed does not do anything when regexVal is true
 *  Sample Code:
 *  $input.attr("onblur", "redcap_validate(this, '2021-01-15','2025-10-01','soft_typed','date_dmy', 1)")
 *
 *  Option 2: Change returntype = "hard", texttype = "date", regexVal = null
 *  Pros: Proper date validation, focuses field on failed validation, no additional code
 *  Cons: Does not maintain date field format
 *  Note: Changing the texttype to date does not maintain the format for date_xyz fields
 *  Sample Code: 
 *  $input.attr("onblur", "redcap_validate(this, '2021-01-15','2025-10-01','hard','date',null)")
 *
 *  Option 3: Wrap the redcap_validate call and refocus element on failed validation
 *  Pros: Can focus field on failed validation, no duplicate code, easier to maintain
 *  Cons: Unable to override alert message that includes 'This value is admissable, but you may wish to verify.'
 *  Sample Code:
 *  function wrapValidation(self, innerFunction) {
 *      var result = innerFunction(self);
 *      console.log('returned from inner function with: ' + result);
 *      // if the element is not valid then focus it
 *  } 
 *  $input.attr("onblur", "wrapValidation(this, function(self) { return redcap_validate(self,'2021-01-15','2025-10-01','hard','date_ymd',1);})")
 *
 *  (Implemented) Option 4: Take relevant redcap_validate code and tweak failed validation behavior and alert message
 *  Pros: Proper date validation, overrides alert message, focuses field on failed validation, maintains date format
 *  Cons: Duplicate code
 * 
 * 
 *  REDCap alert call:
 *  var uniqueID = 'someUniqueID';
 *  var msg = 'some message';
 *  initDialog(uniqueID);
 *  $(`#${uniqueID}`).html(msg);
 *  simpleDialog(msg, null, uniqueID);
 * 
 *  Relevant thread: // https://community.projectredcap.org/questions/41383/use-datepicker-in-external-module-custom-code.html
 **/
var decodeHtml = function(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

const reDates = /(\d{4}-\d{2}-\d{2}[^']*)/g;
let isValidClick = false;

$(document).ready(function () {
	let module = ExternalModules['PreventPastOrFutureDates'].ExternalModule;
	let preventFutureDateFields = JSON.parse(decodeHtml(module.tt('preventFutureDateFields')));
	let preventPastDateFields = JSON.parse(decodeHtml(module.tt('preventPastDateFields')));
	let attachedListeners = false;

	// REDCap calls $.datepicker.setDefaults() after External Module javascript is executed.
	// Because of this the restrictions on the jQuery UI datepicker need to be applied after
	// all scripts have been loaded.
	$('#form').on('mousemove', function() {
		if (!attachedListeners) {
			attachedListeners = true;
			applyDateRestrictions(preventFutureDateFields, preventFutureDate);
			applyDateRestrictions(preventPastDateFields, preventPastDate);
		}
	});

	
});

function applyDateRestrictions(dateFields, fn) {
	for (const field of dateFields) {
		fn(field);
	}
}

// Sets the maxDate option on the jQuery UI datepicker
function preventFutureDate(field) {
	let $input = $(`#${field}-tr input`);
	let inputAttrVal = $input.attr("value");

	// Prevent validation for vields that were set correctly before
	if (inputAttrVal) return;

	let onBlur = $input.attr("onblur");
	let dateFormat = $input.attr('fv');
	let minDate = '';
	// Maintain minDate if one is applied, otherwise leave blank
	try {
		[minDate, _] = onBlur.match(reDates);
	} catch (e) {}

	// REDCap uses both datepicker and datetimepicker resulting in odd behavior when applying min and max dates. 
	// When a min/max date is applied to the datepicker all time formats are removed from the input field.
	// To preserve time formats the value is stored, the min/max date is set, and the input value is set with the stored value.
	if (isDateTime(dateFormat)) {
		let previousValue = $input.val();
		$input.datepicker("option", "maxDate", "+0d");
		// TODO: Figure out how to apply constrainInput
		$input.val(previousValue);
	} else {
		$input.datepicker("option", "maxDate", "+0d");
		$input.datepicker("option", "constrainInput", true);
		// REDCap initalizes datepickers with onSelect, however doing so prevents the input field from maintaining focus and being valided if the datepicker is selected more than once 
		// By using onClose instead (as REDCAP initializes datetimepicker) the input will not lose focus and thereby prevent circumventing validation
		$input.datepicker("option", "onSelect", null);
		$input.datepicker("option", "onClose", function(){ $(this).focus(); dataEntryFormValuesChanged=true; try{ calculate($(this).attr('name'));doBranching($(this).attr('name')); }catch(e){ } });
	}

	// Override onblur callback function 
	$input.attr("onblur", "validate(this, '" + minDate + "','" + getBoundary(dateFormat, false) + "','soft-typed','" + dateFormat + "',1)");
}

// Sets the minDate option on the jQuery UI datepicker
function preventPastDate(field) {
	let $input = $(`#${field}-tr input`);
	let inputAttrVal = $input.attr("value");

	// Prevent validation for vields that were set correctly before
	if (inputAttrVal) return;

	let onBlur = $input.attr("onblur");
	let dateFormat = $input.attr('fv');
	let maxDate = '';
	// Maintain maxDate if one is applied, otherwise leave blank
	try {
		[_, maxDate] = onBlur.match(reDates);
	} catch (e) {}


	// REDCap uses both datepicker and datetimepicker resulting in odd behavior when applying min and max dates. 
	// When a min/max date is applied to the datepicker all time formats are removed from the input field.
	// To preserve time formats the value is stored, the min/max date is set, and the input value is set with the stored value.
	if (isDateTime(dateFormat)) {
		let previousValue = $input.val();
		$input.datepicker("option", "minDate", "-0d");
		// TODO: Figure out how to apply constrainInput
		$input.val(previousValue);
	} else {
		$input.datepicker("option", "minDate", "-0d");
		$input.datepicker("option", "constrainInput", true);
		$input.datepicker("option", "onSelect", null);
		// REDCap initalizes datepickers with onSelect, however doing so prevents the input field from maintaining focus and being valided if the datepicker is selected more than once 
		// By using onClose instead (as REDCAP initializes datetimepicker) the input will not lose focus and thereby prevent circumventing validation
		$input.datepicker("option", "onClose", function(){ $(this).focus(); dataEntryFormValuesChanged=true; try{ calculate($(this).attr('name'));doBranching($(this).attr('name')); }catch(e){ } });
	}

	// Override onblur callback function 
	$input.attr("onblur", "validate(this, '" + getBoundary(dateFormat, true) + "','" + maxDate + "','soft-typed','" + dateFormat + "',1)");
}

function isDateTime(format) {
	return format.indexOf('datetime_') >= 0;
}

function getBoundary(datetimeFormat, isLowerBound) {
	let today = new Date().toISOString().slice(0, 10);
	// matches datetime_seconds_xyz
	if (datetimeFormat.indexOf('datetime_seconds_') >= 0) {
		return today + " " + ((isLowerBound) ? "00:00:00" : "23:59:59");
		// matches datetime_xyz
	} else if (datetimeFormat.indexOf('datetime_') >= 0) {
		return today + " " + ((isLowerBound) ? "00:00" : "23:59");
		// matches date_xyz
	} else if (datetimeFormat.indexOf('date_') >= 0) {
		return today;
	}
}

// Relevant snippets copied from base.js/redcap_validate(ob, min, max, returntype, texttype, regexVal, returnFocus, dateDelimiterReturned)
function validate(ob, min, max, returntype, texttype, regexVal, returnFocus) {
	var origVal;

	// Reset flag on page
	$('#field_validation_error_state').val('0');

	// If blank, or a valid missing data code, do nothing
	if (ob.value == '' || $.inArray(ob.value, missing_data_codes) !== -1) {
		ob.style.fontWeight = 'normal';
		ob.style.backgroundColor='#FFFFFF';
		//console.log('is blank or missing data code');
		return true;
	}
	origVal = ob.value;
	
	// If datetime-picker was just clicked, do nothing because onblur will check this later unless the datetime-picker clicked is not sibling
	try {		
		var isSibling = object_clicked.prev().attr('id') === $(ob).attr('id');

		// If the datepicker was just clicked then set isValidClick to true to allow for siblings to be clicked without triggering validation before onblur
		if (isSibling && typeof object_clicked == 'object' && object_clicked.hasClass('ui-datepicker-trigger')) {
			ob.style.fontWeight = 'normal';
			ob.style.backgroundColor='#FFFFFF';
			isValidClick = true;
			return true;
		}

		// If any sibling of the datepicker is clicked, defer validation to onblur
		if  (isValidClick && object_clicked.parents('.ui-datepicker:visible').length > 0 || object_clicked.siblings('input').attr('id') === $(ob).attr('id')) {
			ob.style.fontWeight = 'normal';
			ob.style.backgroundColor='#FFFFFF';
			isValidClick = false;
			return true;
		}
	} catch(e) { }
	
	// Get ID of field: If field does not have an id, then given it a random one so later we can reference it directly.
	var obId = $(ob).attr('id');
	if (obId == null) {
		obId = "val-"+Math.floor(Math.random()*10000000000000000);
		$(ob).attr('id', obId);
	}
	
	// Set the Javascript for returning focus back on element (if specified)
	if (returnFocus == null) returnFocus = 1;
	var returnFocusJS = (returnFocus == 1) ? "$('#"+obId+"').focus();" : "";
	
	if (regexVal != null)
	{
		// Before evaluating with regex, first do some cleaning
		ob.value = trim(ob.value);

		// Set id for regex validation dialog div
		var regexValPopupId = 'redcapValidationErrorPopup';

		// For date[time][_seconds] fields, replace any periods or slashes with a dash. Add any leading zeros.
		if (texttype=="date_ymd" || texttype=="date_mdy" || texttype=="date_dmy") {
			ob.value = redcap_clean_date(ob.value,texttype);
			if (ob.value.split('-').length == 2) {
				// If somehow contains just one dash, then remove the dash and re-validate it to force reformatting
				return $(ob).val(ob.value.replace(/-/g,'')).trigger('blur');
			}
			var thisdate = ob.value;
			var thistime = '';
		} else if (texttype=="datetime_ymd" || texttype=="datetime_mdy" || texttype=="datetime_dmy"
				|| texttype=="datetime_seconds_ymd" || texttype=="datetime_seconds_mdy" || texttype=="datetime_seconds_dmy") {
			var dt_array = ob.value.split(' ');
			if (dt_array[1] == null) dt_array[1] = '';
			var thisdate = redcap_clean_date(dt_array[0],texttype);
			var thistime = redcap_pad_time(dt_array[1]);
			ob.value = trim(thisdate+' '+thistime);
			if (ob.value.split('-').length == 2) {
				// If somehow contains just one dash, then remove the dash and re-validate it to force reformatting
				return $(ob).val(ob.value.replace(/-/g,'')).trigger('blur');
			}
		}

		// Obtain regex from hidden divs on page (where they are stored)
		var regexDataType = '';
		if (regexVal === 1) {
			regexVal = $('#valregex_divs #valregex-'+texttype).html();
			regexDataType = $('#valregex_divs #valregex-'+texttype).attr('datatype');
		}
		
		// Evaluate value with regex
		// Remove leading and trailing '/'
		var regexVal2 = new RegExp(regexVal.slice(1,-1)); 
		if (regexVal2.test(ob.value))
		{
			// Passed the regex test!

			// // Reformat phone format, if needed
			// if (texttype=="phone") {
			// 	ob.value = ob.value.replace(/-/g,"").replace(/ /g,"").replace(/\(/g,"").replace(/\)/g,"").replace(/\./g,"");
			// 	if (ob.value.length > 10) {
			// 		ob.value = trim(reformatUSPhone(ob.value.substr(0,10))+" "+trim(ob.value.substr(10)));
			// 	} else {
			// 		ob.value = reformatUSPhone(ob.value);
			// 	}
			// }
			// // Make sure time has a leading zero if hour is single digit
			// else if (texttype=="time" && ob.value.length == 4) {
			// 	ob.value = "0"+ob.value;
			// }
			// // If a date[time] field and the returnDelimiter is specified, then do a delimiter replace
			// else if (dateDelimiterReturned != null && dateDelimiterReturned != '-' && (texttype.substring(0,5) == 'date_' || texttype.substring(0,9) == 'datetime_')) {
			// 	ob.value = ob.value.replace(/-/g, dateDelimiterReturned);
			// }

			// If the value has been reformatted above, then we run calculate() and doBranching() for this field based on its NEW value.
			if (origVal != ob.value) {
				try{ calculate($(ob).attr('name')); doBranching($(ob).attr('name')); }catch(e){ }
			}
			
			// If a date/time field, check if its datepicker widget is opened
			var hasDatePicker = $(ob).parentsUntil('tr').find('.ui-datepicker-trigger').length;
			var hasDataPickerOpened = hasDatePicker ? $('#ui-datepicker-div:visible').length : false;

			// Now do range check (if needed) for various validation types
			if ((min != '' || max != '')) // && !hasDataPickerOpened)
			{
				holder1 = ob.value;
				holder2 = min;
				holder3 = max;

				
				// Range check - date[time][_seconds]
				if (texttype=="date_ymd" || texttype=="date_mdy" || texttype=="date_dmy"
					|| texttype=="datetime_ymd" || texttype=="datetime_mdy" || texttype=="datetime_dmy"
					|| texttype=="datetime_seconds_ymd" || texttype=="datetime_seconds_mdy" || texttype=="datetime_seconds_dmy")
				{
					// Convert date format of value to YMD to compare with min/max, which are already in YMD format
					if (/_mdy/.test(texttype)) {
						holder1 = trim(date_mdy2ymd(thisdate)+' '+thistime);
						var min_array = min.split(' ');
						if (min_array[1] == null) min_array[1] = '';
						min = trim(date_ymd2mdy(min_array[0],texttype)+' '+min_array[1]);
						var max_array = max.split(' ');
						if (max_array[1] == null) max_array[1] = '';
						max = trim(date_ymd2mdy(max_array[0],texttype)+' '+max_array[1]);
					} else if (/_dmy/.test(texttype)) {
						holder1 = trim(date_dmy2ymd(thisdate)+' '+thistime);
						var min_array = min.split(' ');
						if (min_array[1] == null) min_array[1] = '';
						min = trim(date_ymd2dmy(min_array[0],texttype)+' '+min_array[1]);
						var max_array = max.split(' ');
						if (max_array[1] == null) max_array[1] = '';
						max = trim(date_ymd2dmy(max_array[0],texttype)+' '+max_array[1]);
					} else {
						holder1 = trim(thisdate+' '+thistime);
					}
					// Ensure that min/max are in YMD format (legacy values could've been in M/D/Y format)
					if (texttype.substr(0,5) == "date_") {
						holder2 = redcap_clean_date(holder2,"date_ymd");
						holder3 = redcap_clean_date(holder3,"date_ymd");
					}
					// Remove all non-numerals so we can compare them numerically
					holder1 = (holder1.replace(/:/g,"").replace(/ /g,"").replace(/-/g,""))*1;
					holder2 = (holder2==='') ? '' : (holder2.replace(/:/g,"").replace(/ /g,"").replace(/-/g,""))*1;
					holder3 = (holder3==='') ? '' : (holder3.replace(/:/g,"").replace(/ /g,"").replace(/-/g,""))*1;
				}
				// Check range
				if ((holder2 !== '' && holder1 < holder2) || (holder3 !== '' && holder1 > holder3)) {
					var msg1 = ($('#valtext_divs #valtext_rangesoft1').length) ? $('#valtext_divs #valtext_rangesoft1').text() : 'The value you provided is outside the suggested range.';
					// var msg2 = ($('#valtext_divs #valtext_rangesoft2').length) ? $('#valtext_divs #valtext_rangesoft2').text() : 'This value is admissible, but you may wish to verify.';
					ob.style.backgroundColor='#FFB7BE';
					var msg = msg1 + ' (' + (min==''?'no limit':min) + ' - ' + (max==''?'no limit':max) +'). ';// + msg2;
					$('#'+regexValPopupId).remove();
					initDialog(regexValPopupId);
					$('#'+regexValPopupId).html(msg);
					setTimeout(function(){
						simpleDialog(msg, null, regexValPopupId, null, returnFocusJS);
					},10);
					return true;
				}
			}
			// Not out of range, so leave the field as normal
			ob.style.fontWeight = 'normal';
			ob.style.backgroundColor='#FFFFFF';
			return true;
		}
	}
	
	var msg = ($('#valtext_divs #valtext_regex').length) ? $('#valtext_divs #valtext_regex').text() : 'The value you provided could not be validated because it does not follow the expected format. Please try again.';

	if ($('#valtext_divs #valtext_requiredformat').length && $('#valregex_divs #valregex-'+texttype).length) {
		// Set default generic message for failure
		msg += '<div class="fvallab">'+$('#valtext_divs #valtext_requiredformat').text()+' '
			+  $('#valregex_divs #valregex-'+texttype).attr('label')+'</div>';
	}

	// Because of strange syncronicity issues of back-to-back fields with validation, set pop-up content first here
	$('#'+regexValPopupId).remove();
	initDialog(regexValPopupId);
	$('#'+regexValPopupId).html(msg);
	// Give alert message of failure
	setTimeout(function(){
		simpleDialog(msg, null, regexValPopupId, null, returnFocusJS);
		$('#'+regexValPopupId).parent().find('button:first').focus();
	},10);
	ob.style.fontWeight = 'bold';
	ob.style.backgroundColor = '#FFB7BE';
	// Set flag on page
	$('#field_validation_error_state').val('1');
	return false;
}
