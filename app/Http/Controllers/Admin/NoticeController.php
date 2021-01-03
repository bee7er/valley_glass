<?php namespace App\Http\Controllers\Admin;

use App\Http\Controllers\AdminController;
use App\Notice;
use App\Http\Requests\Admin\NoticeRequest;
use Datatables;

class NoticeController extends AdminController
{
    /**
     * NoticeController constructor.
     */
    public function __construct()
    {
        view()->share('type', 'notice');
    }

    /**
     * Show a list of all the notice posts.
     *
     * @return View
     */
    public function index()
    {
        $notices = $this->getNotices();

        // Show the page
        return view('admin.notice.index', compact('notices'));
    }

    /**
     * Show the form for creating a new notice.
     *
     * @return Response
     */
    public function create()
    {
        // Show the page
        return view('admin.notice.create_edit');
    }

    /**
     * Store a newly created notice in storage.
     *
     * @param NoticeRequest $request
     * @return Response
     */
    public function store(NoticeRequest $request)
    {
        $notice = new Notice($request->all());

        $notice->save();
    }

    public function edit(Notice $notice)
    {
        return view('admin.notice.create_edit', compact('notice'));
    }

    /**
     * Update the specified notice in storage.
     *
     * @param NoticeRequest $request
     * @param Notice $notice
     * @return Response
     * @internal param int $id
     */
    public function update(NoticeRequest $request, Notice $notice)
    {
        $notice->update($request->all());
    }

    /**
     * Remove the specified notice from storage.
     *
     * @param $id
     * @return Response
     */

    public function delete(Notice $notice)
    {
        return view('admin.notice.delete', compact('notice'));
    }

    /**
     * Remove the specified notice from storage.
     *
     * @param $id
     * @return Response
     */
    public function destroy(Notice $notice)
    {
        $notice->delete();
    }

    /**
     * Get all notices
     *
     * @return array
     */
    public function getNotices()
    {
        return Notice::orderBy('seq', 'ASC')
            ->get()
            ->map(function ($notice) {
                return [
                    'id' => $notice->id,
                    'seq' => $notice->seq,
                    'notice' => $notice->notice,
                    'created_at' => $notice->created_at->format('d/m/Y'),
                ];
            });
    }

    /**
     * Show a list of all the notice posts formatted for Datatables.
     *
     * @return Datatables JSON
     */
    public function data()
    {
        $notices = $this->getNotices();

        return Datatables::of($notices)
            ->add_column('actions', '<a href="{{{ url(\'admin/notice/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm iframe" ><span class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
                <a href="{{{ url(\'admin/notice/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger iframe"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
                <input type="hidden" name="row" value="{{$id}}" id="row">')
            ->remove_column('id')
            ->make();
    }
}
