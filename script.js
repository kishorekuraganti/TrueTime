document.addEventListener("DOMContentLoaded", function () {
  const calculateBtn = document.getElementById("calculateBtn");
  const resultsSection = document.getElementById("results");
  const greetingMessage = document.getElementById("greetingMessage");
  const beforeTimeElement = document.getElementById("beforeTime");
  const afterTimeElement = document.getElementById("afterTime");

  // Initialize minute dropdowns
  initializeMinuteDropdowns();

  // Initialize gender slider functionality
  initializeGenderSlider();

  calculateBtn.addEventListener("click", function () {
    calculateTimings();
  });

  function initializeMinuteDropdowns() {
    const minuteSelects = document.querySelectorAll(".minute-select");

    minuteSelects.forEach((select) => {
      // Clear existing options
      select.innerHTML = "";

      // Add minutes from 00 to 59
      for (let i = 0; i < 60; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i.toString().padStart(2, "0");
        select.appendChild(option);
      }
    });
  }

  function initializeGenderSlider() {
    const genderOptions = document.querySelectorAll(
      '.gender-option input[type="radio"]'
    );
    const sliderThumb = document.querySelector(".slider-thumb");

    genderOptions.forEach((option) => {
      option.addEventListener("change", function () {
        // Update slider position based on selection
        const gender = this.value;

        if (gender === "male") {
          sliderThumb.style.left = "3px";
        } else {
          sliderThumb.style.left = "28px";
        }
      });
    });

    // Add click event to the slider itself
    const genderSlider = document.querySelector(".gender-slider");
    genderSlider.addEventListener("click", function () {
      const maleRadio = document.getElementById("gender-male");
      const femaleRadio = document.getElementById("gender-female");

      if (maleRadio.checked) {
        femaleRadio.checked = true;
        sliderThumb.style.left = "28px";
      } else {
        maleRadio.checked = true;
        sliderThumb.style.left = "3px";
      }
    });
  }

  function showGreetingMessage(gender) {
    // Hide results initially
    resultsSection.style.display = "none";

    // Set greeting message based on gender
    let message = "";
    if (gender === "female") {
      message = "Hey! You look beautiful today ❤️";
      greetingMessage.className = "greeting-message female";
    } else {
      message = "Hey! You look handsome today 🤩";
      greetingMessage.className = "greeting-message male";
    }

    greetingMessage.innerHTML = `<p>${message}</p>`;
    greetingMessage.style.display = "block";

    // Show results after a short delay
    setTimeout(() => {
      resultsSection.style.display = "block";
    }, 1000);
  }

  function calculateTimings() {
    try {
      // Get gender value
      const gender = document.querySelector(
        'input[name="gender"]:checked'
      ).value;

      // Show greeting message first
      showGreetingMessage(gender);

      // Get InTime values
      const inHour = parseInt(
        document.querySelector(".time-input-group:nth-child(1) .hour-select")
          .value
      );
      const inMinute = parseInt(
        document.querySelector(".time-input-group:nth-child(1) .minute-select")
          .value
      );
      const inAmPm = document.querySelector(
        'input[name="in-ampm"]:checked'
      ).value;

      // Get OutTime values
      const outHour = parseInt(
        document.querySelector(".time-input-group:nth-child(2) .hour-select")
          .value
      );
      const outMinute = parseInt(
        document.querySelector(".time-input-group:nth-child(2) .minute-select")
          .value
      );
      const outAmPm = document.querySelector(
        'input[name="out-ampm"]:checked'
      ).value;

      // Get total hours
      const totalHoursInput = document.getElementById("totalHours");
      const targetHours = parseFloat(totalHoursInput.value);

      // Validate inputs
      if (!targetHours || targetHours < 0 || targetHours > 20) {
        alert("Please enter a valid total working hours between 0 and 20");
        totalHoursInput.focus();
        return;
      }

      // Convert to 24-hour format for parsing
      const startTime = parseTime(inHour, inMinute, inAmPm);
      const endTime = parseTime(outHour, outMinute, outAmPm);

      // Calculate according to Java logic
      const result = calculateTimeRanges(startTime, endTime, targetHours);

      // Update display
      if (result.extraTimeNeeded) {
        // Show time ranges in single lines
        beforeTimeElement.textContent = `${result.beforeStart} - ${result.beforeEnd}`;
        afterTimeElement.textContent = `${result.afterStart} - ${result.afterEnd}`;

        // Ensure normal styling
        beforeTimeElement.className = "time-frame";
        afterTimeElement.className = "time-frame";
        resultsSection.querySelector(".result-output").style.display = "flex";
      } else {
        // Show no extra time needed message
        beforeTimeElement.textContent = "No extra time needed";
        afterTimeElement.textContent = "Target already met or exceeded";
        beforeTimeElement.className = "time-frame no-extra-time";
        afterTimeElement.className = "time-frame no-extra-time";
      }
    } catch (error) {
      alert("Error calculating timings: " + error.message);
      console.error("Calculation error:", error);
    }
  }

  function parseTime(hours, minutes, ampm) {
    // Convert to 24-hour format
    let hour24 = hours;
    if (ampm === "PM" && hours !== 12) {
      hour24 = hours + 12;
    } else if (ampm === "AM" && hours === 12) {
      hour24 = 0;
    }

    // Create a Date object for today with the given time
    const time = new Date();
    time.setHours(hour24, minutes, 0, 0);
    return time;
  }

  function calculateTimeRanges(startTime, endTime, targetHours) {
    // Calculate actual duration in minutes
    const actualDurationMs = endTime - startTime;
    let actualMinutes = Math.floor(actualDurationMs / (1000 * 60));

    // Handle case where end time is before start time (overnight)
    if (actualMinutes < 0) {
      actualMinutes += 24 * 60; // Add 24 hours
    }

    const targetMinutes = Math.floor(targetHours * 60);
    let extraMinutes = targetMinutes - actualMinutes;

    if (extraMinutes <= 0) {
      return {
        extraTimeNeeded: false,
        message: "No extra time needed. Target already met or exceeded.",
      };
    }

    // Add 1 minute as per Java logic
    extraMinutes += 1;

    // Calculate time ranges as per Java logic
    const beforeStart = new Date(
      startTime.getTime() - extraMinutes * 60 * 1000
    );
    const beforeEnd = new Date(startTime.getTime() - 1 * 60 * 1000);
    const afterStart = new Date(endTime.getTime() + 1 * 60 * 1000);
    const afterEnd = new Date(endTime.getTime() + extraMinutes * 60 * 1000);

    // Format times for display
    const formatter = (date) => {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";

      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;
    };

    return {
      extraTimeNeeded: true,
      beforeStart: formatter(beforeStart),
      beforeEnd: formatter(beforeEnd),
      afterStart: formatter(afterStart),
      afterEnd: formatter(afterEnd),
      extraHours: Math.floor(extraMinutes / 60),
      extraMinutes: extraMinutes % 60,
    };
  }
});
