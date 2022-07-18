import fetch from '../util/fetch-fill';
import URI from 'urijs';

// /records endpoint
window.path = 'http://localhost:3000/records';

// Your retrieve function plus any additional functions go here ...
const MAX_CONTENT = 500;
const LIMIT = 10;
const PRIMARY_COLORS = ['red', 'blue', 'yellow'];
const parseData = (jsonResponse, page) => {
    const data = jsonResponse;
    const ids = [];
    const open = [];
    let closedPrimaryCount = 0;
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        ids.push(item.id);
        if (item.disposition === 'open') {
            open.push({
                ...item,
                isPrimary: PRIMARY_COLORS.includes(item.color),
            });
        }
        closedPrimaryCount +=
            item.disposition === 'closed' && PRIMARY_COLORS.includes(item.color)
                ? 1
                : 0;
    }
    return {
        previousPage: page <= 1 ? null : page - 1,
        nextPage:
            page * LIMIT >= MAX_CONTENT || !!!data.length ? null : page + 1,
        ids,
        open,
        closedPrimaryCount,
    };
};
async function retrieve(filter) {
    const { page = 1, colors = [] } = filter || {};
    let offset = (page - 1) * LIMIT;
    let limit = LIMIT;
    let url = URI(window.path)
        .search({ limit, offset, 'color[]': colors })
        .toString();
    try {
        const response = await fetch(url, { method: 'GET' });
        if (response.status === 200) {
            const jsonData = await response.json();
            return parseData(jsonData, page || 1);
        } else {
            console.log('Error');
        }
    } catch (error) {
        console.log(error);
    }
}
export default retrieve;
