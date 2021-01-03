<?php namespace App\Http\Controllers\Admin;

use App\Http\Controllers\AdminController;
use App\Credit;
use App\Http\Requests\Admin\CreditRequest;
use App\Resource;
use Datatables;

class CreditController extends AdminController
{
    /**
     * CreditController constructor.
     */
    public function __construct()
    {
        view()->share('type', 'credit');
    }

    /**
     * Show a list of all the credit posts.
     *
     * @return View
     */
    public function index(Resource $resource)
    {
        session(['resourceId' => $resource->id]);

        $credits = $this->getCredits();

        $noSideBar = true;

        // Show the page
        return view('admin.credit.index', compact('resource', 'credits', 'noSideBar'));
    }

    /**
     * Show the form for creating a new credit.
     *
     * @return Response
     */
    public function create()
    {
        // Show the page
        return view('admin.credit.create_edit');
    }

    /**
     * Store a newly created credit in storage.
     *
     * @return Response
     */
    public function store(CreditRequest $request)
    {
        $credit = new Credit($request->all());

        $credit->resourceId = session('resourceId');

        $credit->save();
    }

    /**
     * Edit credit
     *
     * @param Credit $credit
     * @return \BladeView|bool|\Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function edit($creditId)
    {
        $credit = Credit::findOrFail($creditId);

        return view('admin.credit.create_edit', compact('credit'));
    }

    /**
     * Update the specified credit in storage.
     *
     * @param  int $id
     * @return Response
     */
    public function update(CreditRequest $request)
    {
        $credit = Credit::findOrFail($request->get('id'));

        $credit->update($request->all());
    }

    /**
     * Remove the specified credit from storage.
     *
     * @param $id
     * @return Response
     */

    public function delete($creditId)
    {
        $credit = Credit::findOrFail($creditId);

        return view('admin.credit.delete', compact('credit'));
    }

    /**
     * Remove the specified credit from storage.
     *
     * @param $id
     * @return Response
     */
    public function destroy($creditId)
    {
        $credit = Credit::findOrFail($creditId);

        $credit->delete();
    }

    /**
     * Get all credits
     *
     * @return array
     */
    public function getCredits()
    {
        return Credit::where('resourceId', session('resourceId'))
            ->orderBy('seq', 'ASC')
            ->get()
            ->map(function ($credit) {
                return [
                    'id' => $credit->id,
                    'seq' => $credit->seq,
                    'title' => $credit->title,
                    'created_at' => $credit->created_at->format('d/m/Y'),
                ];
            });
    }

    /**
     * Show a list of all the credit posts formatted for Datatables.
     *
     * @return Datatables JSON
     */
    public function data()
    {
        $credits = $this->getCredits(true);

        return Datatables::of($credits)
            ->add_column('actions', '<a href="{{{ url(\'admin/credit/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm iframe" ><span
class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
                <a href="{{{ url(\'admin/credit/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger iframe"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
                <input type="hidden" name="row" value="{{$id}}" id="row">')
            ->remove_column('id')
            ->make();
    }
}
