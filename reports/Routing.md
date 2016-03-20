# Report on Routing

### Why we need Routing?

- Bookmarking

*Users need to keep bookmarks of specific destinations*

- Sharing

*Users need to share content by sending a link*

- Navigation

*Using the tradition forward-backward buttons on a regular Browser*



### Which package?

[Flow Router](https://github.com/kadirahq/flow-router)

**Why?**

- Simplicity
- Conciseness
- Official Support (the suggested routing package by meteor)

An example:

    FlowRouter.route('/post/:id', {
        action: function(params) {
            console.log("Looking at post n. " + params.id)
        }
    });
)



## Routing scheme for studious octo spork

The routing scheme should follow the models and MongoDB logic. A starting scheme:

    Simple routes:

    /   --> Main page, index
    /about, /contact    --> Self-explaining
    /tasks  --> View available work to do
    /register   --> Should have a link for fishing people

    Groups:

    /user   --> Main users page, will offer overview, browsing or search.
    /user/:id   --> User profile
    /user/:id/contact   --> Maybe a contact form (???)


*Awaiting approval & discussion*

*S.*
