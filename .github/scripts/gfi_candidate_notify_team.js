// Script to notify the team when a Good First Issue Candidate is created.

const marker = '<!-- GFI Candidate Notification -->';
const TEAM_ALIAS = '@hiero-ledger/hiero-sdk-good-first-issue-support';

async function notifyTeam(github, owner, repo, issue, message, marker) {
  const comment = `${marker} :wave: Hello Team :wave:
${TEAM_ALIAS}

${message}

Repository: ${owner}/${repo} : Issue: #${issue.number} - ${issue.title || '(no title)'}

Best Regards,
Python SDK team`;

  try {
    await github.rest.issues.createComment({
      owner,
      repo,
      issue_number: issue.number,
      body: comment,
    });
    console.log(`Notified team about GFI candidate #${issue.number}`);
    return true;
  } catch (commentErr) {
    console.log(`Failed to notify team about GFI candidate #${issue.number}:`, commentErr.message || commentErr);
    return false;
  }
}

module.exports = async ({ github, context }) => {
  try {
    const { owner, repo } = context.repo;
    const { issue, label } = context.payload;

    if (!issue?.number) return console.log('No issue in payload');

    const labelName = label?.name;
    if (!labelName) return;

    let message = '';
    if (labelName === 'Good First Issue Candidate') {
      message = 'A new Good First Issue Candidate has been created. Please review it and confirm whether it should be labeled as a Good First Issue.';
    } else {
      return;
    }

    // Check for existing comment
    const comments = await github.paginate(github.rest.issues.listComments, {
      owner, repo, issue_number: issue.number, per_page: 100
    });
    if (comments.some(c => c.body?.includes(marker))) {
      return console.log(`Notification already exists for #${issue.number}`);
    }

    // Post notification
    const success = await notifyTeam(github, owner, repo, issue, message, marker);

    if (success) {
      console.log('=== Summary ===');
      console.log(`Repository: ${owner}/${repo}`);
      console.log(`Issue Number: ${issue.number}`);
      console.log(`Label: ${labelName}`);
      console.log(`Message: ${message}`);
    }

  } catch (err) {
    console.log('❌ Error:', err.message);
  }
};