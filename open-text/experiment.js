/*
-------------------------------------------------
------------> Firebase setup <---------------
-------------------------------------------------
*/
// Import libraries
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
    // enableIndexedDbPersistence,
    // getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentSingleTabManager,
    collection,
    doc,
    setDoc,
    updateDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
    getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Load DB with enablde persistence - NEW - https://firebase.google.com/docs/firestore/manage-data/enable-offline
const db = initializeFirestore(app, {
    localCache: persistentLocalCache(/*settings*/{tabManager: persistentSingleTabManager()})
});

// Establish authentication
const auth = getAuth(app)
signInAnonymously(auth).catch(function (err) {
    let errorCode = err.code;
    let errorMessage = err.message;
    console.log(errorCode);
    console.log(errorMessage);
})

// Setup requisite objects
const currentUser = new User(uid)
const jsPsych = my_jsPsych_init();
let timeline = []

// Sign in and Ensure UID is established
function waitForUserAuth(timeout) {
    let start = performance.now()
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                currentUser.uid = user.uid;
                resolve(user.uid);
                unsubscribe(); // Clean up the subscription when done
            } else if (timeout && (performance.now() - start) >= timeout) {
                reject(new Error("Timeout while waiting for user authentication"));
            }
        });

        function waitForUid(resolve, reject) {
            if (currentUser.uid) {
                resolve(currentUser.uid);
            } else if (timeout && (performance.now() - start) >= timeout) {
                reject(new Error("Timeout while getting firebase UID"));
            } else {
                setTimeout(waitForUid.bind(this, resolve, reject), 30);
            }
        }

        waitForUid(resolve, reject);
    });
}

function get_code(currentUser_instance, code_name) {
    return new Promise((resolve, reject) => {
        let code = null
        if (do_online) {
            const unsubscribe = onAuthStateChanged(auth, async function (user) {
                try {
                    if (user) {
                        if (user.uid === currentUser_instance.uid) {
                            // const codeDoc = collection(db, 'codes')
                            const codeDoc = doc(collection(db, 'codes'), code_name);
                            const snap = await getDoc(codeDoc)
                            if (snap.exists()) {
                                code = snap.data()['code']
                                // console.log(code)
                            } else {
                                console.error('code not in data')
                            }
                            resolve(code);
                        } else {
                            console.log('\tuser ids dont match')
                            reject(new Error('User IDs do not match')); // Reject the promise with an error
                        }
                    } else {
                        console.log('\tuser signed out');
                        reject(new Error('User signed out')); // Reject the promise with an error
                    }
                } catch (error) {
                    console.error('\tError handling user document:', error);
                    reject(error)
                } finally {
                    unsubscribe()
                }
            })
        } else {
            // do nothing
            console.log('offline, no code')
            resolve()
        }
    })
}

// ===>>> CHECK CONSENT FUNCTION <<<=== //
function retrieve_user_values(currentUser_instance, variables) {
    // console.log('Retrieve consent')
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async function (user) {
            try {
                if (user) {
                    if (user.uid === currentUser_instance.uid) {
                        const subDoc = doc(collection(doc(collection(db, 'tasks'), firestore_task), 'subjects'), user.uid);
                        const snap = await getDoc(subDoc)
                        if (!Array.isArray(variables)) {
                            variables = [variables];
                        }
                        let return_object = {}
                        if (snap.exists()) {
                            for (let variable of variables) {
                                if (variable in snap.data()) {
                                    // console.log('var to retrieve: '+variable)
                                    // console.log('var value: '+snap.data()[variable])
                                    return_object[variable] = snap.data()[variable];
                                } else {
                                    console.log(variable + ' key not dataset')
                                    return_object[variable] = null
                                }
                            }
                            // console.log(snap.data())
                        }
                        resolve(return_object);
                    } else {
                        console.log('\tuser ids dont match')
                        reject(new Error('User IDs do not match')); // Reject the promise with an error
                    }
                } else {
                    console.log('\tuser signed out');
                    reject(new Error('User signed out')); // Reject the promise with an error
                }
            } catch (error) {
                console.error('\tError handling user document:', error);
                reject(error)
            } finally {
                unsubscribe()
            }

        })

    })
}

// ===>>> CREATE DATABASE ENTRY FOR THE USER <<<=== //
function create_user_db(currentUser_instance) {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async function (user) {
            try {
                if (user) {
                    if (user.uid === currentUser_instance.uid) {
                        const subDoc = doc(collection(doc(collection(db, 'tasks'), firestore_task), 'subjects'), user.uid);
                        const snap = await getDoc(subDoc)
                        if (console_debug) {
                            console.log('sub exists: ', snap.exists())
                        }
                        if (!snap.exists()) {
                            await setDoc(subDoc, {
                                uid: currentUser_instance.uid,
                                PID: currentUser_instance.PID,
                                ST_ID: currentUser_instance.ST_ID,
                                SE_ID: currentUser_instance.SE_ID,
                                date: new Date().toLocaleDateString('en-GB'),
                                time: new Date().toLocaleTimeString('en-GB'),
                                completed: 'No',
                                returned: 'No',
                                consented: 'Yes',
                                feedback: '',
                                recent_task: 't_001',
                                warning_count: 0,
                                task_version: firestore_task
                            });
                            // Create empty docs to store data
                            // await setDoc(doc(collection(subDoc, 'questions'), 'phq9_questions'), {init: true})
                            // await setDoc(doc(collection(subDoc, 'questions'), 'gad7_questions'), {init: true})
                            // await setDoc(doc(collection(subDoc, 'questions'), 'ids30_questions'), {init: true})
                            // await setDoc(doc(collection(subDoc, 'questions'), 'sds_questions'), {init: true})
                            // await setDoc(doc(collection(subDoc, 'questions'), 'lvl1_closed_questions'), {init: true})
                            // await setDoc(doc(collection(subDoc, 'questions'), 'lvl2_closed_questions'), {init: true})
                            await setDoc(doc(collection(subDoc, 'questions'), 'open_questions'), {init: true})
                            await setDoc(doc(collection(subDoc, 'questions'), 'open_questions_rts'), {init: true})
                            await setDoc(doc(collection(subDoc, 'questions'), 'open_questions_dump'), {init: true})
                            // await setDoc(doc(collection(subDoc, 'questions'), 'emotions'), {init: true})
                        }
                        resolve()
                    } else {
                        console.log('user ids dont match')
                        reject(new Error('User IDs do not match or user signed out'));
                    }
                } else {
                    console.log('user signed out');
                    reject(new Error('User signed out'));
                }
            } catch (error) {
                console.error('Error creating user document:', error);
                reject(error)
            } finally {
                unsubscribe()
            }

        })
    })
}

// ===>>> CHECK IDS FOR THE USER <<<=== //
function check_user_db(currentUser_instance) {
    return new Promise((resolve, reject) => {
        return retrieve_user_values(currentUser_instance, ['PID', 'SE_ID', 'ST_ID']).then(user_values => {
            currentUser_instance.get_ids(jsPsych) // read URL params
            // compare IDs with database
            if (user_values.PID === currentUser_instance.PID && user_values.ST_ID === currentUser_instance.ST_ID && user_values.SE_ID === currentUser_instance.SE_ID) {
                // prolific IDs match
                resolve()
            } else {
                //Prolific ids dont match
                reject(new Error(prolific_ids_error));
            }
        }).catch((error) => {
            reject(error)
        })
    })
}

// ===>>> CONSENT AND COMPLETION CHECK FUNCTIONS <<<=== //
function check_consent() {
    return new Promise((resolve, reject) => {
        const confirmButton = document.getElementById('confirmButton');
        // Ensure the button is clicked
        if (confirmButton) {
            confirmButton.onclick = function () {
                let consentGiven
                if (quick_consent) {
                    consentGiven = document.getElementById('consent_checkbox1').checked
                } else {

                    consentGiven = document.getElementById('consent_checkbox1').checked && document.getElementById('consent_checkbox2').checked && document.getElementById('consent_checkbox3').checked && document.getElementById('consent_checkbox4').checked && document.getElementById('consent_checkbox5').checked && document.getElementById('consent_checkbox6').checked && document.getElementById('consent_checkbox7').checked
                }
                currentUser.consent = consentGiven
                // Assuming consent form is handled here
                if (consentGiven) {
                    currentUser.get_ids(jsPsych) // assign URL ids
                    // create a user
                    create_user_db(currentUser).then(() => {
                        // console.log('Consent given! Proceeding with experiment');
                        document.getElementById('jspsych-experiment').innerHTML = "";
                        resolve();
                    }).catch((error) => {
                        console.error('Error creating user db')
                        reject(error)
                    })
                } else {
                    if (confirm('Unfortunately, you will be unable to participate in this research study if you do not consent to the above. Thank you for your time.')) {
                        console.error('Consent not given')
                        reject(new Error(no_consent_error));
                    }
                }
            };
        } else {
            console.error('Consent button not found')
            reject(new Error('Consent button not found'));
        }
    })
}

function handleConsent() {
    return retrieve_user_values(currentUser, 'consented').then(user_values => {
        if (!user_values.consented || (user_values.consented !== 'Yes' && user_values.consented !== 'No')) {
            // First time visiting, display consent form
            const consentElement = document.getElementById('jspsych-experiment');
            if (consentElement) {
                consentElement.innerHTML = consent_content;
                return check_consent(); // Return the promise outcome from check_consent
            } else {
                console.error("Consent element not found")
                return Promise.reject(new Error("Consent element not found"));
            }
        } else {
            if (user_values.consented === 'Yes') {
                // function to retrieve the id and compare with PID etc
                return check_user_db(currentUser).then(() => {
                    console.log('Prolific IDs match')
                    return Promise.resolve(); // Consent already given
                }).catch((error) => {
                    console.error('Prolific IDs dont match')
                    return Promise.reject(error)
                })
            } else if (user_values.consented === 'No') {
                console.error('Not consented')
                return Promise.reject(new Error('Not consented'));

            } else {
                console.error('Consent status error')
                return Promise.reject(new Error('Consent status error'));
            }
        }
    }).catch((error) => {
        // console.error('Error in retrieving data in handleConsent:', error)
        return Promise.reject(error)
    });
}

function handleCompletion() {
    return retrieve_user_values(currentUser, 'completed').then(user_values => {
        if (!user_values.completed || (user_values.completed !== 'Yes' && user_values.completed !== 'No')) {
            console.error('Completion status loading error')
            return Promise.reject(new Error('Completion status loading error'));
        } else {
            if (user_values.completed === 'Yes') {
                console.error('Study already completed')
                return Promise.reject(new Error(study_completed_error));
            } else if (user_values.completed === 'No') {
                // Run the study
                console.log('Run the study')
                return Promise.resolve();
            } else {
                console.error('Completion status other error')
                return Promise.reject(new Error('Completion status other error'));
            }
        }
    }).catch((error) => {
        // console.error('Error in retrieving data in handlecompletion:', error)
        return Promise.reject(error)
    })
}

// Allows updating documents within subjects collections
function updateUserDoc(auth_instance, currentUser_instance, object, which_col, which_doc) {
    return new Promise((resolve, reject) => {
        if (do_online) {
            const unsubscribe = onAuthStateChanged(auth_instance, async function (user) {
                try {
                    if (user) {
                        if (user.uid === currentUser_instance.uid) {
                            const subDoc = doc(collection(doc(collection(doc(collection(db, 'tasks'), firestore_task), 'subjects'), user.uid), which_col), which_doc);
                            await updateDoc(subDoc, object);
                            resolve()
                        } else {
                            console.log('user ids dont match')
                            reject(new Error('User IDs do not match or user signed out'));
                        }
                    } else {
                        console.log('user signed out');
                        reject(new Error('User signed out'));
                        // return false
                    }
                } catch (error) {
                    console.error('Error saving data:', error);
                    reject(error)
                } finally {
                    unsubscribe()
                }
            });
        } else {
            // do nothing
            // console.log('offline')
            resolve()
            // return true
        }
    })
}

// Allows updating subject document field with arbitrary json object
function updateUser(auth_instance, currentUser_instance, object) {
    return new Promise((resolve, reject) => {
        if (do_online) {
            const unsubscribe = onAuthStateChanged(auth_instance, async function (user) {
                try {
                    if (user) {
                        if (user.uid === currentUser_instance.uid) {
                            const subDoc = doc(collection(doc(collection(db, 'tasks'), firestore_task), 'subjects'), user.uid);
                            await updateDoc(subDoc, object);
                            resolve()
                        } else {
                            console.log('user ids dont match')
                            reject(new Error('User IDs do not match or user signed out'));
                        }
                    } else {
                        console.log('user signed out');
                        reject(new Error('User signed out'));
                        // return false
                    }
                } catch (error) {
                    console.error('Error saving data:', error);
                    reject(error)
                } finally {
                    unsubscribe()
                }
            });
        } else {
            // do nothing
            console.log('offline')
            resolve()
            // return true
        }
    })
}

//
//------------> Study trials <---------------
//

// Welcome and instructions
let welcome_trial = {
    type: jsPsychHtmlKeyboardResponse,
    // trial_duration: debug_mode,
    post_trial_gap: 500,
    choices: ['n'],
    stimulus: welcome_text,
}
let instructions = {
    type: jsPsychInstructions,
    pages: instr_pages,
    show_clickable_nav: true,
    button_label_previous: 'Go to the previous page',
    button_label_next: 'Go to the next page',
    allow_keys: false,
    on_page_change: function (current_page) {
        let next_button_element = document.querySelector('button#jspsych-instructions-next')
        if (current_page === instr_pages.length - 1) {
            next_button_element.innerHTML = '<b style="color:red"><u>Start the experiment!</u></b>'
        }
    },
    show_page_number: true
}

// RELMED open-ended questions
let q_count = 0
let relmed_open_timeline_array = []
let q_max = relmed_question_array.length
for (let i = 0; i < q_max; i++) {
    q_count += 1
    relmed_open_timeline_array.push(question_trial(relmed_question_array, i, q_count, updateUserDoc, updateUser, auth, currentUser, jsPsych))
}
let relmed_open_timeline = {
    timeline: relmed_open_timeline_array
}

// Run the study
function runStudy() {
    // Welcome trial
    timeline.push(welcome_trial) // <--------

    // Instructions timeline
    timeline.push(instructions) // <--------
    timeline.push(relmed_open_timeline); // <--------


    if (run_sim) {
        jsPsych.simulate(timeline)
    } else {
        jsPsych.run(timeline);
    }
}

// Main promises - establish UID and consent then run study
document.addEventListener('DOMContentLoaded', function () {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Alert the user and do not display the consent form
        alert("Sorry, this experiment does not work on mobile devices");
        document.getElementById('jspsych-experiment').innerHTML = mobile_text

    } else {
        if (do_online) {
            waitForUserAuth().then(() => {
                // UID established
                console.log('User logged in')
                currentUser.get_ids(jsPsych) // assign URL ids
                // create a user
                create_user_db(currentUser).then(() => {
                    // console.log('Consent given! Proceeding with experiment');
                    document.getElementById('jspsych-experiment').innerHTML = "";
                    // resolve();
                    runStudy();
                }).catch((error) => {
                    console.error('Error creating user db')
                    reject(error)
                })

                // handleConsent().then(() => {
                //     // Consent is given (either just now or in the past), now run the study
                //     handleCompletion().then(() => {
                //         // Study not completed yet
                //         runStudy();
                //     }).catch(error => {
                //         console.error('Completion handling error:', error);
                //         if (error.message === study_completed_error) {
                //             // Handle when study already completed by the participant
                //             document.getElementById('jspsych-experiment').innerHTML = completed_text;
                //         } else {
                //             document.getElementById('jspsych-experiment').innerHTML = generic_error;
                //         }
                //     })
                // }).catch(error => {
                //     console.error('Consent handling error:', error);
                //     // console.log(Error(no_consent_error))
                //     if (error.message === no_consent_error) {
                //         get_code(currentUser, 'no_consent').then(code => {
                //             console.log('Exiting with no_consent code: ', code)
                //             if (do_online) {
                //                 window.location.href = base_url + code
                //             }
                //         }).catch(() => {
                //             document.getElementById('jspsych-experiment').innerHTML = generic_error;
                //         })
                //     }
                //     if (error.message === prolific_ids_error) {
                //         // Prolific IDs don't match
                //         document.getElementById('jspsych-experiment').innerHTML = generic_error;
                //     }
                //     // Handle the error case, e.g., redirect to another page or display a message
                // });
            }).catch(error => {
                console.error("Failed to initialize task config:", error);
            })
        } else {
            // offline version - just run the study
            runStudy();
        }
    }

});

